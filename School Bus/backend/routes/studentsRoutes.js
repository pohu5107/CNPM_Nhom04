// /backend/routes/studentsRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/students - Lấy danh sách tất cả học sinh
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class_id,
                c.class_name,
                s.class,
                s.address,
                s.phone,
                s.parent_id,
                p.name as parent_name,
                p.phone as parent_phone,
                p.address as parent_address,
                p.relationship,
                s.morning_route_id,
                mr.route_name as morning_route_name,
                s.afternoon_route_id,
                ar.route_name as afternoon_route_name,
                s.morning_pickup_stop_id,
                mps.name as morning_pickup_stop_name,
                s.afternoon_dropoff_stop_id,
                ads.name as afternoon_dropoff_stop_name,
                s.status
            FROM students s
            LEFT JOIN parents p ON s.parent_id = p.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes mr ON s.morning_route_id = mr.id
            LEFT JOIN routes ar ON s.afternoon_route_id = ar.id
            LEFT JOIN stops mps ON s.morning_pickup_stop_id = mps.id
            LEFT JOIN stops ads ON s.afternoon_dropoff_stop_id = ads.id
            WHERE s.status = 'active'
            ORDER BY s.id DESC
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
                s.id,
                s.name,
                s.grade,
                s.class_id,
                c.class_name,
                s.class,
                c.homeroom_teacher,
                s.address,
                s.phone,
                s.parent_id,
                p.name as parent_name,
                p.phone as parent_phone,
                p.address as parent_address,
                p.relationship,
                s.morning_route_id,
                mr.route_name as morning_route_name,
                s.afternoon_route_id,
                ar.route_name as afternoon_route_name,
                s.morning_pickup_stop_id,
                mps.name as morning_pickup_stop_name,
                mps.address as morning_pickup_stop_address,
                s.afternoon_dropoff_stop_id,
                ads.name as afternoon_dropoff_stop_name,
                ads.address as afternoon_dropoff_stop_address,
                s.status,
                -- Thông tin schedule mới nhất cho morning route
                ms.scheduled_start_time as morning_start_time,
                ms.scheduled_end_time as morning_end_time,
                ms.bus_id as morning_bus_id,
                mb.bus_number as morning_bus_number,
                mb.license_plate as morning_license_plate,
                -- Thông tin schedule mới nhất cho afternoon route
                as_table.scheduled_start_time as afternoon_start_time,
                as_table.scheduled_end_time as afternoon_end_time,
                as_table.bus_id as afternoon_bus_id,
                ab.bus_number as afternoon_bus_number,
                ab.license_plate as afternoon_license_plate
            FROM students s
            LEFT JOIN parents p ON s.parent_id = p.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes mr ON s.morning_route_id = mr.id
            LEFT JOIN routes ar ON s.afternoon_route_id = ar.id
            LEFT JOIN stops mps ON s.morning_pickup_stop_id = mps.id
            LEFT JOIN stops ads ON s.afternoon_dropoff_stop_id = ads.id
            LEFT JOIN schedules ms ON s.morning_route_id = ms.route_id 
                AND ms.shift_type = 'morning' 
                AND ms.date = (
                    SELECT MAX(date) FROM schedules 
                    WHERE route_id = s.morning_route_id AND shift_type = 'morning'
                )
            LEFT JOIN buses mb ON ms.bus_id = mb.id
            LEFT JOIN schedules as_table ON s.afternoon_route_id = as_table.route_id 
                AND as_table.shift_type = 'afternoon' 
                AND as_table.date = (
                    SELECT MAX(date) FROM schedules 
                    WHERE route_id = s.afternoon_route_id AND shift_type = 'afternoon'
                )
            LEFT JOIN buses ab ON as_table.bus_id = ab.id
            WHERE s.id = ? AND s.status = 'active'
            LIMIT 1
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
        const { 
            name, 
            grade, 
            class: class_name, 
            parent_id, 
            phone, 
            address,
            morning_route_id,
            morning_pickup_stop_id,
            afternoon_route_id,
            afternoon_dropoff_stop_id
        } = req.body;
        
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
        
        const [result] = await pool.execute(`
            INSERT INTO students (
                name, grade, class_id, class, parent_id, phone, address, 
                morning_route_id, morning_pickup_stop_id, 
                afternoon_route_id, afternoon_dropoff_stop_id, 
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `, [
            name, grade, class_id, class_name, parent_id || null, phone || null, address || null,
            morning_route_id || null, morning_pickup_stop_id || null,
            afternoon_route_id || null, afternoon_dropoff_stop_id || null
        ]);
        
        // Get the created student with full info
        const [newStudent] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class_id,
                c.class_name,
                s.class,
                s.address,
                s.phone,
                s.parent_id,
                p.name as parent_name,
                p.phone as parent_phone,
                s.morning_route_id,
                mr.route_name as morning_route_name,
                s.afternoon_route_id,
                ar.route_name as afternoon_route_name,
                s.status
            FROM students s
            LEFT JOIN parents p ON s.parent_id = p.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes mr ON s.morning_route_id = mr.id
            LEFT JOIN routes ar ON s.afternoon_route_id = ar.id
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
        const { 
            name, 
            grade, 
            class: class_name, 
            parent_id, 
            phone, 
            address,
            morning_route_id,
            morning_pickup_stop_id,
            afternoon_route_id,
            afternoon_dropoff_stop_id
        } = req.body;
        
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
        
        await pool.execute(`
            UPDATE students 
            SET name = ?, grade = ?, class_id = ?, class = ?, parent_id = ?, 
                phone = ?, address = ?, morning_route_id = ?, morning_pickup_stop_id = ?,
                afternoon_route_id = ?, afternoon_dropoff_stop_id = ?
            WHERE id = ?
        `, [
            name, grade, class_id, class_name, parent_id || null, phone || null, address || null,
            morning_route_id || null, morning_pickup_stop_id || null,
            afternoon_route_id || null, afternoon_dropoff_stop_id || null,
            id
        ]);
        
        // Get updated student
        const [updatedStudent] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class_id,
                c.class_name,
                s.class,
                s.address,
                s.phone,
                s.parent_id,
                p.name as parent_name,
                p.phone as parent_phone,
                s.morning_route_id,
                mr.route_name as morning_route_name,
                s.afternoon_route_id,
                ar.route_name as afternoon_route_name,
                s.status
            FROM students s
            LEFT JOIN parents p ON s.parent_id = p.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes mr ON s.morning_route_id = mr.id
            LEFT JOIN routes ar ON s.afternoon_route_id = ar.id
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