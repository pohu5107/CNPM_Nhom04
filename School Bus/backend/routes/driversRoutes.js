// /backend/routes/driversRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

const sendError = (res, err, msg = 'Lỗi server') => {
  console.error(msg, err);
  return res.status(500).json({ success: false, message: msg, error: err?.message });
};

const getDriverById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT d.*, u.email, u.username FROM drivers d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ?`,
    [id]
  );
  return rows[0];
};

// GET /api/drivers - danh sách tài xế
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT d.*, u.email, u.username FROM drivers d LEFT JOIN users u ON d.user_id = u.id ORDER BY d.id ASC`);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    sendError(res, err, 'Lỗi khi lấy danh sách tài xế');
  }
});

// GET /api/drivers/:id
router.get('/:id', async (req, res) => {
  try {
    const driver = await getDriverById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Không tìm thấy tài xế' });
    res.json({ success: true, data: driver });
  } catch (err) {
    sendError(res, err, 'Lỗi khi lấy thông tin tài xế');
  }
});

// POST /api/drivers - thêm tài xế
router.post('/', async (req, res) => {
  try {
    const { name, phone, license_number, address, status = 'active' } = req.body;
    if (!name || !phone || !license_number) return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: tên, số điện thoại, số bằng lái' });

    const [existing] = await pool.execute('SELECT id FROM drivers WHERE license_number = ?', [license_number]);
    if (existing.length) return res.status(400).json({ success: false, message: 'Số bằng lái đã tồn tại' });

    const username = `driver_${license_number}`;
    const email = `${username}@schoolbus.com`;
    const defaultPassword = license_number;

    let user_id = null;
    try {
      const [userResult] = await pool.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "driver")', [username, email, defaultPassword]);
      user_id = userResult.insertId;
    } catch (userErr) {
      if (userErr.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Tài khoản với số bằng lái này đã tồn tại' });
      throw userErr;
    }

    const [result] = await pool.execute('INSERT INTO drivers (name, phone, license_number, address, status, user_id) VALUES (?, ?, ?, ?, ?, ?)', [name, phone, license_number, address || null, status, user_id]);
    const driver = await getDriverById(result.insertId);
    res.status(201).json({ success: true, message: 'Thêm tài xế thành công', data: driver });
  } catch (err) {
    sendError(res, err, 'Lỗi khi thêm tài xế');
  }
});

// PUT /api/drivers/:id - cập nhật tài xế
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, license_number, address, status } = req.body;

    const [existing] = await pool.execute('SELECT id, user_id, license_number FROM drivers WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Không tìm thấy tài xế' });
    const current = existing[0];

    const [licenseExists] = await pool.execute('SELECT id FROM drivers WHERE license_number = ? AND id != ?', [license_number, id]);
    if (licenseExists.length) return res.status(400).json({ success: false, message: 'Số bằng lái đã tồn tại' });

    let user_id = current.user_id;
    if (!user_id) {
      const username = `driver_${license_number}`;
      const email = `${username}@schoolbus.com`;
      const defaultPassword = license_number;
      try {
        const [userResult] = await pool.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "driver")', [username, email, defaultPassword]);
        user_id = userResult.insertId;
      } catch (userErr) {
        if (userErr.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Tài khoản với số bằng lái này đã tồn tại' });
        throw userErr;
      }
    } else if (license_number !== current.license_number) {
      const newUsername = `driver_${license_number}`;
      const newEmail = `${newUsername}@schoolbus.com`;
      await pool.execute('UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?', [newUsername, newEmail, license_number, user_id]);
    }

    await pool.execute('UPDATE drivers SET name = ?, phone = ?, license_number = ?, address = ?, status = ?, user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, phone, license_number, address || null, status, user_id, id]);
    const driver = await getDriverById(id);
    res.json({ success: true, message: 'Cập nhật tài xế thành công', data: driver });
  } catch (err) {
    sendError(res, err, 'Lỗi khi cập nhật tài xế');
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute('SELECT id, user_id FROM drivers WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Không tìm thấy tài xế' });
    const driver = existing[0];
    await pool.execute('DELETE FROM drivers WHERE id = ?', [id]);
    if (driver.user_id) await pool.execute('DELETE FROM users WHERE id = ?', [driver.user_id]);
    res.json({ success: true, message: 'Xóa tài xế thành công' });
  } catch (err) {
    sendError(res, err, 'Lỗi khi xóa tài xế');
  }
});

// GET /api/drivers/:id/details - thông tin tài xế và lịch trình
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await getDriverById(id);
    if (!driver) return res.status(404).json({ success: false, message: 'Không tìm thấy tài xế' });

    const [scheduleRows] = await pool.execute(`
      SELECT s.id, s.date, s.shift_type, s.scheduled_start_time AS start_time, s.scheduled_end_time AS end_time,
             'Điểm bắt đầu' AS start_point, 'Điểm kết thúc' AS end_point, r.route_name, r.distance, b.bus_number, b.license_plate, b.status AS bus_status
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      WHERE s.driver_id = ?
      ORDER BY s.date DESC, s.scheduled_start_time ASC
    `, [id]);

    res.json({ success: true, data: { ...driver, schedules: scheduleRows } });
  } catch (err) {
    sendError(res, err, 'Lỗi khi lấy thông tin chi tiết tài xế');
  }
});

export default router;