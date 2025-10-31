// /backend/routes/adminScheduleRouter.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/schedules - Lấy danh sách tất cả lịch trình
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                d.name AS driver_name,
                b.bus_number,
                b.license_plate,
                r.route_name,
                s.date,
                s.shift_type,
                s.shift_number,
                s.start_time,
                s.end_time,
                s.start_point,
                s.end_point,
                s.estimated_duration,
                s.student_count,
                s.max_capacity,
                s.status,
                s.notes
            FROM schedules s
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            ORDER BY s.date DESC, s.shift_number
        `);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách lịch trình',
            error: error.message
        });
    }
});

// GET /api/schedules/:id - Lấy thông tin một lịch trình
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                d.name AS driver_name,
                s.driver_id,
                b.bus_number,
                s.bus_id,
                r.route_name,
                s.route_id,
                s.date,
                s.shift_type,
                s.shift_number,
                s.start_time,
                s.end_time,
                s.start_point,
                s.end_point,
                s.estimated_duration,
                s.student_count,
                s.max_capacity,
                s.status,
                s.notes
            FROM schedules s
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE s.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch trình'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin lịch trình',
            error: error.message
        });
    }
});

// POST /api/schedules - Thêm lịch trình mới
router.post('/', async (req, res) => {
    try {
        const {
            driver_id,
            bus_id,
            route_id,
            date,
            shift_type,
            shift_number,
            start_time,
            end_time,
            start_point,
            end_point,
            estimated_duration,
            student_count,
            max_capacity,
            notes
        } = req.body;

        // Validate required fields
        if (!driver_id || !bus_id || !route_id || !date || !shift_type || !shift_number || !start_time || !end_time || !start_point || !end_point) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO schedules (
                driver_id, bus_id, route_id, date, shift_type, shift_number,
                start_time, end_time, start_point, end_point,
                estimated_duration, student_count, max_capacity, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `, [
            driver_id, bus_id, route_id, date, shift_type, shift_number,
            start_time, end_time, start_point, end_point,
            estimated_duration || 60, student_count || 0, max_capacity || 25, notes || null
        ]);

        // Get the newly created schedule
        const [newSchedule] = await pool.execute('SELECT * FROM schedules WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Thêm lịch trình thành công',
            data: newSchedule[0]
        });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm lịch trình',
            error: error.message
        });
    }
});

// PUT /api/schedules/:id - Cập nhật lịch trình
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            driver_id,
            bus_id,
            route_id,
            date,
            shift_type,
            shift_number,
            start_time,
            end_time,
            start_point,
            end_point,
            estimated_duration,
            student_count,
            max_capacity,
            status,
            notes
        } = req.body;

        // Check if schedule exists
        const [existing] = await pool.execute('SELECT id FROM schedules WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch trình'
            });
        }

        await pool.execute(`
            UPDATE schedules SET
                driver_id = ?, bus_id = ?, route_id = ?, date = ?, shift_type = ?, shift_number = ?,
                start_time = ?, end_time = ?, start_point = ?, end_point = ?,
                estimated_duration = ?, student_count = ?, max_capacity = ?, status = ?, notes = ?
            WHERE id = ?
        `, [
            driver_id, bus_id, route_id, date, shift_type, shift_number,
            start_time, end_time, start_point, end_point,
            estimated_duration || 60, student_count || 0, max_capacity || 25, status || 'scheduled', notes || null,
            id
        ]);

        // Get updated schedule
        const [updatedSchedule] = await pool.execute('SELECT * FROM schedules WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Cập nhật lịch trình thành công',
            data: updatedSchedule[0]
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật lịch trình',
            error: error.message
        });
    }
});

// DELETE /api/schedules/:id - Xóa lịch trình
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if schedule exists
        const [existing] = await pool.execute('SELECT id FROM schedules WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch trình'
            });
        }

        await pool.execute('DELETE FROM schedules WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa lịch trình thành công'
        });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa lịch trình',
            error: error.message
        });
    }
});

export default router;
