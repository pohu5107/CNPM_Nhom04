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
            SELECT id, class_name, grade, academic_year, max_students, status
            FROM classes
            WHERE status = 'active'
            ORDER BY grade ASC, class_name ASC
        `);
        res.json({ success: true, data: rows, count: rows.length });
    } catch (err) {
        sendError(res, err, 'Lỗi khi lấy danh sách lớp học');
    }
});

export default router;
