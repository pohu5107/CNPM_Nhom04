// /backend/routes/classesRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/classes - Lấy danh sách tất cả lớp học
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                id,
                class_name,
                grade,
                academic_year,
                homeroom_teacher,
                max_students,
                status
            FROM classes
            WHERE status = 'active'
            ORDER BY grade ASC, class_name ASC
        `);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách lớp học',
            error: error.message
        });
    }
});

// GET /api/classes/:id - Lấy thông tin chi tiết 1 lớp
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.execute(`
            SELECT 
                c.*,
                COUNT(s.id) as student_count
            FROM classes c
            LEFT JOIN students s ON c.class_name = s.class AND s.status = 'active'
            WHERE c.id = ?
            GROUP BY c.id
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lớp học'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching class:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin lớp học',
            error: error.message
        });
    }
});

// GET /api/classes/statistics - Thống kê lớp học
router.get('/statistics/all', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM view_class_statistics
            ORDER BY grade ASC, class_name ASC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching class statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê lớp học',
            error: error.message
        });
    }
});

export default router;
