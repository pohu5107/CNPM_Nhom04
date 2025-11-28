import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Tạo thông báo mới (thường là sự cố từ driver)
router.post('/', async (req, res) => {
  try {
    console.log('📧 Notifications POST request received:', req.body);
    const { driver_id, schedule_id, type = 'incident', title = 'Thông báo sự cố', message, route_name } = req.body;

    if (!driver_id || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'driver_id và message là bắt buộc' 
      });
    }

    const query = `
      INSERT INTO notifications (driver_id, schedule_id, type, title, message, route_name, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'unread', NOW())
    `;

    console.log('📧 Executing query with params:', [driver_id, schedule_id, type, title, message, route_name]);
    const [result] = await pool.execute(query, [driver_id, schedule_id, type, title, message, route_name]);
    console.log('📧 Insert result:', result);

    // Lấy thông báo vừa tạo để trả về
    const [newNotification] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [result.insertId]
    );
    console.log('📧 New notification created:', newNotification[0]);

    res.status(201).json({
      success: true,
      message: 'Thông báo đã được tạo thành công',
      data: newNotification[0]
    });

  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi tạo thông báo' 
    });
  }
});

// Lấy danh sách thông báo mới nhất (để parent kiểm tra)
router.get('/latest', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const query = `
      SELECT n.*, d.name as driver_name
      FROM notifications n
      LEFT JOIN drivers d ON n.driver_id = d.id
      ORDER BY n.created_at DESC
      LIMIT ?
    `;

    const [notifications] = await pool.execute(query, [parseInt(limit)]);

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy thông báo' 
    });
  }
});

// Đánh dấu thông báo đã đọc
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'UPDATE notifications SET status = "read" WHERE id = ?';
    const [result] = await pool.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      message: 'Đã đánh dấu thông báo đã đọc'
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật thông báo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật thông báo' 
    });
  }
});

// Lấy thông báo theo driver_id
router.get('/driver/:driver_id', async (req, res) => {
  try {
    const { driver_id } = req.params;
    const { limit = 10 } = req.query;

    const query = `
      SELECT * FROM notifications
      WHERE driver_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [notifications] = await pool.execute(query, [driver_id, parseInt(limit)]);

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Lỗi khi lấy thông báo theo driver:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy thông báo theo driver' 
    });
  }
});

export default router;