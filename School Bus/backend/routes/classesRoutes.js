// /backend/routes/classesRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

const sendError = (res, err, msg = 'Lỗi server') => {
    console.error(msg, err);
    return res.status(500).json({ success: false, message: msg, error: err?.message });
};

// GET /api/classes - danh sách lớp active
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, class_name, grade, academic_year, homeroom_teacher, max_students, status
            FROM classes
            WHERE status = 'active'
            ORDER BY grade ASC, class_name ASC
        `);
        res.json({ success: true, data: rows, count: rows.length });
    } catch (err) {
        sendError(res, err, 'Lỗi khi lấy danh sách lớp học');
    }
});

// GET /api/classes/:id - chi tiết lớp (kèm số lượng học sinh)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            `SELECT c.*, COUNT(s.id) AS student_count
             FROM classes c
             LEFT JOIN students s ON c.class_name = s.class AND s.status = 'active'
             WHERE c.id = ?
             GROUP BY c.id`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        sendError(res, err, 'Lỗi khi lấy thông tin lớp học');
    }
});

// GET /api/classes/statistics/all - thống kê lớp
router.get('/statistics/all', async (req, res) => {
    try {
        const [rows] = await pool.execute(`SELECT * FROM view_class_statistics ORDER BY grade ASC, class_name ASC`);
        res.json({ success: true, data: rows });
    } catch (err) {
        sendError(res, err, 'Lỗi khi lấy thống kê lớp học');
    }
});

export default router;
