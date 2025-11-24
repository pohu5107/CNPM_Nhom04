// /backend/routes/parentsRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

const sendError = (res, err, msg = 'Lỗi server') => {
  console.error(msg, err);
  return res.status(500).json({ success: false, message: msg, error: err?.message });
};

const getParentById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT p.id, p.name, COALESCE(u.email, 'Chưa có') AS email, COALESCE(u.username, '') AS username, p.phone, p.address, p.relationship, 'active' AS status, p.user_id
     FROM parents p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
    [id]
  );
  return rows[0];
};

// GET /api/parents - danh sách phụ huynh
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.id, p.name, COALESCE(u.email, 'Chưa có') AS email, COALESCE(u.username, '') AS username, p.phone, p.address, p.relationship, 'active' AS status,
             COUNT(s.id) AS children_count, GROUP_CONCAT(s.name SEPARATOR ', ') AS children_names
      FROM parents p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN students s ON p.id = s.parent_id
      GROUP BY p.id, p.name, u.email, u.username, p.phone, p.address, p.relationship
      ORDER BY p.id DESC
    `);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    sendError(res, err, 'Lỗi khi lấy danh sách phụ huynh');
  }
});

// GET /api/parents/:id
router.get('/:id', async (req, res) => {
  try {
    const parent = await getParentById(req.params.id);
    if (!parent) return res.status(404).json({ success: false, message: 'Không tìm thấy phụ huynh' });
    res.json({ success: true, data: parent });
  } catch (err) {
    sendError(res, err, 'Lỗi khi lấy thông tin phụ huynh');
  }
});

// GET /api/parents/:id/children
router.get('/:id/children', async (req, res) => {
  try {
    const { id } = req.params;
    const [children] = await pool.execute(`
      SELECT s.id, s.name, s.grade, s.class, c.class_name, s.address, s.phone AS student_phone, s.status,
             s.morning_route_id, mr.route_name AS morning_route_name, s.morning_pickup_stop_id, mps.name AS morning_pickup_stop_name,
             s.afternoon_route_id, ar.route_name AS afternoon_route_name, s.afternoon_dropoff_stop_id, ads.name AS afternoon_dropoff_stop_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN routes mr ON s.morning_route_id = mr.id
      LEFT JOIN routes ar ON s.afternoon_route_id = ar.id
      LEFT JOIN stops mps ON s.morning_pickup_stop_id = mps.id
      LEFT JOIN stops ads ON s.afternoon_dropoff_stop_id = ads.id
      WHERE s.parent_id = ? AND s.status = 'active' ORDER BY s.name ASC
    `, [id]);
    res.json({ success: true, data: children, count: children.length });
  } catch (err) {
    sendError(res, err, 'Lỗi khi lấy danh sách con');
  }
});

// POST /api/parents - thêm phụ huynh
router.post('/', async (req, res) => {
  try {
  const { name, username, email, phone, address, relationship } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: tên và số điện thoại' });

    const [existingPhone] = await pool.execute('SELECT id FROM parents WHERE phone = ?', [phone]);
    if (existingPhone.length) return res.status(400).json({ success: false, message: 'Số điện thoại đã tồn tại' });

    let user_id = null;
    if (email && email !== '') {
     
      if (!username) return res.status(400).json({ success: false, message: 'Username là bắt buộc khi tạo tài khoản phụ huynh' });

   
      const [existingUsername] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUsername.length) return res.status(400).json({ success: false, message: 'Username đã tồn tại' });

      const [existingEmail] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail.length) return res.status(400).json({ success: false, message: 'Email đã tồn tại' });

      const defaultPassword = '123456';

      const [userResult] = await pool.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "parent")', [username, email, defaultPassword]);
      user_id = userResult.insertId;
    }

    const [result] = await pool.execute('INSERT INTO parents (name, phone, address, relationship, user_id) VALUES (?, ?, ?, ?, ?)', [name, phone, address || null, relationship || 'Phụ huynh', user_id]);
    const parent = await getParentById(result.insertId);
    res.status(201).json({ success: true, message: 'Thêm phụ huynh thành công', data: parent });
  } catch (err) {
    sendError(res, err, 'Lỗi khi thêm phụ huynh');
  }
});

// PUT /api/parents/:id - cập nhật phụ huynh
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
  const { name, username, email, phone, address, relationship } = req.body;
    const [existing] = await pool.execute('SELECT id, user_id FROM parents WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Không tìm thấy phụ huynh' });

    const [existingPhone] = await pool.execute('SELECT id FROM parents WHERE phone = ? AND id != ?', [phone, id]);
    if (existingPhone.length) return res.status(400).json({ success: false, message: 'Số điện thoại đã tồn tại' });

    let user_id = existing[0].user_id;
    if (email && email !== '' && email !== 'Chưa có') {
      if (user_id) {

        const [existingEmail] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, user_id]);
        if (existingEmail.length) return res.status(400).json({ success: false, message: 'Email đã tồn tại' });

        if (username) {
          const [existingUsername] = await pool.execute('SELECT id FROM users WHERE username = ? AND id != ?', [username, user_id]);
          if (existingUsername.length) return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
          await pool.execute('UPDATE users SET email = ?, username = ? WHERE id = ?', [email, username, user_id]);
        } else {
          await pool.execute('UPDATE users SET email = ? WHERE id = ?', [email, user_id]);
        }
      } else {
   
        if (!username) return res.status(400).json({ success: false, message: 'Username là bắt buộc khi tạo tài khoản phụ huynh' });
        const [existingEmail] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length) return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
        const [existingUsername] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername.length) return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
        const defaultPassword = '123456';
        const [userResult] = await pool.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "parent")', [username, email, defaultPassword]);
        user_id = userResult.insertId;
      }
    } else if ((!email || email === '' || email === 'Chưa có') && user_id) {
      await pool.execute('DELETE FROM users WHERE id = ?', [user_id]);
      user_id = null;
    }

    await pool.execute('UPDATE parents SET name = ?, phone = ?, address = ?, relationship = ?, user_id = ? WHERE id = ?', [name, phone, address || null, relationship || 'Phụ huynh', user_id, id]);
    const parent = await getParentById(id);
    res.json({ success: true, message: 'Cập nhật phụ huynh thành công', data: parent });
  } catch (err) {
    sendError(res, err, 'Lỗi khi cập nhật phụ huynh');
  }
});

// DELETE /api/parents/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute('SELECT id, user_id FROM parents WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Không tìm thấy phụ huynh' });
    const [children] = await pool.execute('SELECT id FROM students WHERE parent_id = ?', [id]);
    if (children.length) return res.status(400).json({ success: false, message: 'Không thể xóa phụ huynh vì còn có con đang học' });
    await pool.execute('DELETE FROM parents WHERE id = ?', [id]);
    if (existing[0].user_id) await pool.execute('DELETE FROM users WHERE id = ?', [existing[0].user_id]);
    res.json({ success: true, message: 'Xóa phụ huynh thành công' });
  } catch (err) {
    sendError(res, err, 'Lỗi khi xóa phụ huynh');
  }
});

export default router;