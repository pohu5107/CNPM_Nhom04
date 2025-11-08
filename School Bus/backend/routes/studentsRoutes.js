// /backend/routes/studentsRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

const sendError = (res, err, msg = 'Lỗi server') => {
  console.error(msg, err);
  return res.status(500).json({ success: false, message: msg, error: err?.message });
};

const getStudentById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT s.id, s.name, s.grade, s.class_id, c.class_name, s.class, c.homeroom_teacher, s.address, s.phone, s.parent_id,
           p.name AS parent_name, p.phone AS parent_phone, p.address AS parent_address, p.relationship,
           s.morning_route_id, mr.route_name AS morning_route_name, s.afternoon_route_id, ar.route_name AS afternoon_route_name,
           s.morning_pickup_stop_id, mps.name AS morning_pickup_stop_name, mps.address AS morning_pickup_stop_address,
           s.afternoon_dropoff_stop_id, ads.name AS afternoon_dropoff_stop_name, ads.address AS afternoon_dropoff_stop_address,
           s.status,
           ms.scheduled_start_time AS morning_start_time, ms.scheduled_end_time AS morning_end_time, ms.bus_id AS morning_bus_id, mb.bus_number AS morning_bus_number, mb.license_plate AS morning_license_plate,
           as_table.scheduled_start_time AS afternoon_start_time, as_table.scheduled_end_time AS afternoon_end_time, as_table.bus_id AS afternoon_bus_id, ab.bus_number AS afternoon_bus_number, ab.license_plate AS afternoon_license_plate
    FROM students s
    LEFT JOIN parents p ON s.parent_id = p.id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN routes mr ON s.morning_route_id = mr.id
    LEFT JOIN routes ar ON s.afternoon_route_id = ar.id
    LEFT JOIN stops mps ON s.morning_pickup_stop_id = mps.id
    LEFT JOIN stops ads ON s.afternoon_dropoff_stop_id = ads.id
    LEFT JOIN schedules ms ON s.morning_route_id = ms.route_id AND ms.shift_type = 'morning' AND ms.date = (
      SELECT MAX(date) FROM schedules WHERE route_id = s.morning_route_id AND shift_type = 'morning'
    )
    LEFT JOIN buses mb ON ms.bus_id = mb.id
    LEFT JOIN schedules as_table ON s.afternoon_route_id = as_table.route_id AND as_table.shift_type = 'afternoon' AND as_table.date = (
      SELECT MAX(date) FROM schedules WHERE route_id = s.afternoon_route_id AND shift_type = 'afternoon'
    )
    LEFT JOIN buses ab ON as_table.bus_id = ab.id
    WHERE s.id = ? AND s.status = 'active' LIMIT 1
  `, [id]);
  return rows[0];
};

// GET /api/students
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.id, s.name, s.grade, s.class_id, c.class_name, s.class, s.address, s.phone, s.parent_id,
             p.name AS parent_name, p.phone AS parent_phone, p.address AS parent_address, p.relationship,
             s.morning_route_id, mr.route_name AS morning_route_name, s.afternoon_route_id, ar.route_name AS afternoon_route_name,
             s.morning_pickup_stop_id, mps.name AS morning_pickup_stop_name, s.afternoon_dropoff_stop_id, ads.name AS afternoon_dropoff_stop_name, s.status
      FROM students s
      LEFT JOIN parents p ON s.parent_id = p.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN routes mr ON s.morning_route_id = mr.id
      LEFT JOIN routes ar ON s.afternoon_route_id = ar.id
      LEFT JOIN stops mps ON s.morning_pickup_stop_id = mps.id
      LEFT JOIN stops ads ON s.afternoon_dropoff_stop_id = ads.id
      WHERE s.status = 'active' ORDER BY s.id DESC
    `);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    sendError(res, err, 'Lỗi khi lấy danh sách học sinh');
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    res.json({ success: true, data: student });
  } catch (err) {
    sendError(res, err, 'Lỗi khi lấy thông tin học sinh');
  }
});

// POST /api/students
router.post('/', async (req, res) => {
  try {
    const { name, grade, class: class_name, parent_id, phone, address, morning_route_id, morning_pickup_stop_id, afternoon_route_id, afternoon_dropoff_stop_id } = req.body;
    if (!name || !grade || !class_name) return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: tên, khối, lớp' });

    const [gradeCheck] = await pool.execute('SELECT DISTINCT grade FROM classes WHERE grade = ?', [grade]);
    if (gradeCheck.length === 0) {
      const [availableGrades] = await pool.execute('SELECT DISTINCT grade FROM classes ORDER BY grade');
      const gradeList = availableGrades.map(r => r.grade).join(', ');
      return res.status(400).json({ success: false, message: `Khối ${grade} không tồn tại. Chỉ có khối: ${gradeList}` });
    }

    const [classRows] = await pool.execute('SELECT id, grade FROM classes WHERE class_name = ?', [class_name]);
    if (classRows.length === 0) return res.status(400).json({ success: false, message: 'Không tìm thấy lớp học' });
    if (classRows[0].grade !== grade) return res.status(400).json({ success: false, message: `Khối ${grade} không khớp với lớp ${class_name} (khối ${classRows[0].grade})` });

    const class_id = classRows[0].id;
    const [result] = await pool.execute(
      `INSERT INTO students (name, grade, class_id, class, parent_id, phone, address, morning_route_id, morning_pickup_stop_id, afternoon_route_id, afternoon_dropoff_stop_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [name, grade, class_id, class_name, parent_id || null, phone || null, address || null, morning_route_id || null, morning_pickup_stop_id || null, afternoon_route_id || null, afternoon_dropoff_stop_id || null]
    );

    const student = await getStudentById(result.insertId);
    res.status(201).json({ success: true, message: 'Thêm học sinh thành công', data: student });
  } catch (err) {
    sendError(res, err, 'Lỗi khi thêm học sinh');
  }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, class: class_name, parent_id, phone, address, morning_route_id, morning_pickup_stop_id, afternoon_route_id, afternoon_dropoff_stop_id } = req.body;
    const [existing] = await pool.execute('SELECT id FROM students WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });

    const [gradeCheck] = await pool.execute('SELECT DISTINCT grade FROM classes WHERE grade = ?', [grade]);
    if (gradeCheck.length === 0) {
      const [availableGrades] = await pool.execute('SELECT DISTINCT grade FROM classes ORDER BY grade');
      const gradeList = availableGrades.map(r => r.grade).join(', ');
      return res.status(400).json({ success: false, message: `Khối ${grade} không tồn tại. Chỉ có khối: ${gradeList}` });
    }

    const [classRows] = await pool.execute('SELECT id, grade FROM classes WHERE class_name = ?', [class_name]);
    if (classRows.length === 0) return res.status(400).json({ success: false, message: 'Không tìm thấy lớp học' });
    if (classRows[0].grade !== grade) return res.status(400).json({ success: false, message: `Khối ${grade} không khớp với lớp ${class_name} (khối ${classRows[0].grade})` });

    const class_id = classRows[0].id;
    await pool.execute('UPDATE students SET name = ?, grade = ?, class_id = ?, class = ?, parent_id = ?, phone = ?, address = ?, morning_route_id = ?, morning_pickup_stop_id = ?, afternoon_route_id = ?, afternoon_dropoff_stop_id = ? WHERE id = ?', [name, grade, class_id, class_name, parent_id || null, phone || null, address || null, morning_route_id || null, morning_pickup_stop_id || null, afternoon_route_id || null, afternoon_dropoff_stop_id || null, id]);
    const student = await getStudentById(id);
    res.json({ success: true, message: 'Cập nhật học sinh thành công', data: student });
  } catch (err) {
    sendError(res, err, 'Lỗi khi cập nhật học sinh');
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute('SELECT id FROM students WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    await pool.execute('DELETE FROM students WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa học sinh thành công' });
  } catch (err) {
    sendError(res, err, 'Lỗi khi xóa học sinh');
  }
});

export default router;