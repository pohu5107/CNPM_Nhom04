// /backend/routes/studentsRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/students - Lấy danh sách tất cả học sinh
router.get('/', async (req, res) => {
    try {
        // Sử dụng VIEW đã tạo trong database_fix.sql
        const [rows] = await pool.execute(`
            SELECT 
                id,
                student_name as name,
                grade,
                class_name,
                address,
                student_phone as phone,
                parent_id,
                parent_name,
                parent_phone,
                route_id,
                route_name,
                bus_id,
                bus_number,
                license_plate,
                pickup_time,
                dropoff_time,
                status
            FROM view_students_with_parents
            ORDER BY id DESC
        `);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách học sinh',
            error: error.message
        });
    }
});

// GET /api/students/:id - Lấy thông tin một học sinh
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT 
                id,
                student_name as name,
                grade,
                class,
                class_name,
                homeroom_teacher,
                address,
                student_phone as phone,
                status,
                pickup_time,
                dropoff_time,
                parent_id,
                parent_name,
                parent_phone,
                parent_address,
                relationship,
                route_id,
                route_name,
                bus_id,
                bus_number,
                license_plate
            FROM view_students_with_parents
            WHERE id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy học sinh'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin học sinh',
            error: error.message
        });
    }
});

// POST /api/students - Thêm học sinh mới
router.post('/', async (req, res) => {
    try {
        const { name, grade, class: class_name, parent_id, phone, address } = req.body;
        
        // Validate required fields
        if (!name || !grade || !class_name) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: tên, khối, lớp'
            });
        }
        
        // Validate grade exists in database
        const [gradeCheck] = await pool.execute(
            'SELECT DISTINCT grade FROM classes WHERE grade = ?',
            [grade]
        );
        
        if (gradeCheck.length === 0) {
            const [availableGrades] = await pool.execute('SELECT DISTINCT grade FROM classes ORDER BY grade');
            const gradeList = availableGrades.map(row => row.grade).join(', ');
            return res.status(400).json({
                success: false,
                message: `Khối ${grade} không tồn tại. Chỉ có khối: ${gradeList}`
            });
        }
        
        // Tìm class_id từ class_name và kiểm tra grade-class consistency
        const [classRows] = await pool.execute(
            'SELECT id, grade FROM classes WHERE class_name = ?',
            [class_name]
        );
        
        if (classRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy lớp học'
            });
        }
        
        // Kiểm tra grade và class có khớp nhau không
        if (classRows[0].grade !== grade) {
            return res.status(400).json({
                success: false,
                message: `Khối ${grade} không khớp với lớp ${class_name} (khối ${classRows[0].grade})`
            });
        }
        
        const class_id = classRows[0].id;
        const class_name_value = class_name; // Lưu class_name từ frontend
        
        const [result] = await pool.execute(`
            INSERT INTO students (name, grade, class_id, class, parent_id, phone, address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
        `, [name, grade, class_id, class_name_value, parent_id || null, phone || null, address || null]);
        
        // Get the created student
        const [newStudent] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class_id,
                c.class_name,
                s.address,
                s.phone,
                s.parent_id,
                p.name as parent_name,
                p.phone as parent_phone,
                s.status
            FROM students s
            LEFT JOIN parents p ON s.parent_id = p.id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Thêm học sinh thành công',
            data: newStudent[0]
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm học sinh',
            error: error.message
        });
    }
});

// PUT /api/students/:id - Cập nhật thông tin học sinh
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, grade, class: class_name, parent_id, phone, address } = req.body;
        
        // Check if student exists
        const [existing] = await pool.execute('SELECT id FROM students WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy học sinh'
            });
        }
        
        // Validate grade exists in database
        const [gradeCheck] = await pool.execute(
            'SELECT DISTINCT grade FROM classes WHERE grade = ?',
            [grade]
        );
        
        if (gradeCheck.length === 0) {
            const [availableGrades] = await pool.execute('SELECT DISTINCT grade FROM classes ORDER BY grade');
            const gradeList = availableGrades.map(row => row.grade).join(', ');
            return res.status(400).json({
                success: false,
                message: `Khối ${grade} không tồn tại. Chỉ có khối: ${gradeList}`
            });
        }
        
        // Tìm class_id từ class_name và kiểm tra grade-class consistency
        const [classRows] = await pool.execute(
            'SELECT id, grade FROM classes WHERE class_name = ?',
            [class_name]
        );
        
        if (classRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy lớp học'
            });
        }
        
        // Kiểm tra grade và class có khớp nhau không
        if (classRows[0].grade !== grade) {
            return res.status(400).json({
                success: false,
                message: `Khối ${grade} không khớp với lớp ${class_name} (khối ${classRows[0].grade})`
            });
        }
        
        const class_id = classRows[0].id;
        const class_name_value = class_name; // Lưu class_name từ frontend
        
        await pool.execute(`
            UPDATE students 
            SET name = ?, grade = ?, class_id = ?, class = ?, parent_id = ?, 
                phone = ?, address = ?
            WHERE id = ?
        `, [name, grade, class_id, class_name_value, parent_id || null, phone || null, address || null, id]);
        
        // Get updated student
        const [updatedStudent] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class_id,
                c.class_name,
                s.address,
                s.phone,
                s.parent_id,
                p.name as parent_name,
                p.phone as parent_phone,
                s.status
            FROM students s
            LEFT JOIN parents p ON s.parent_id = p.id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        `, [id]);
        
        res.json({
            success: true,
            message: 'Cập nhật học sinh thành công',
            data: updatedStudent[0]
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật học sinh',
            error: error.message
        });
    }
});

// DELETE /api/students/:id - Xóa học sinh
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if student exists
        const [existing] = await pool.execute('SELECT id FROM students WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy học sinh'
            });
        }
        
        await pool.execute('DELETE FROM students WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Xóa học sinh thành công'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa học sinh',
            error: error.message
        });
    }
});

export default router;