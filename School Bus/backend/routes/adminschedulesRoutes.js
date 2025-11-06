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
                DATE_FORMAT(s.date, '%Y-%m-%d') as date,
                s.shift_type,
                s.shift_number,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                'Điểm bắt đầu' as start_point,
                'Điểm kết thúc' as end_point,
                60 as estimated_duration,
                s.student_count,
                25 as max_capacity,
                s.status,
                s.notes
            FROM schedules s
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            ORDER BY s.date DESC, s.shift_number
        `);

        // Format data để đồng bộ với driver format
        const formattedRows = rows.map(row => ({
            ...row,
            id: `CH${String(row.id).padStart(3, '0')}`, // Format giống driver
            schedule_id: row.id, // Giữ ID gốc để CRUD
            shift_display: row.shift_type === 'morning' ? `Ca ${row.shift_number} - Sáng` : 
                          row.shift_type === 'afternoon' ? `Ca ${row.shift_number} - Chiều` :
                          `Ca ${row.shift_number}`
        }));

        res.json({
            success: true,
            data: formattedRows,
            count: formattedRows.length
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
        let { id } = req.params;
        
        // Xử lý ID format - nếu là "CH001" thì lấy số 1
        if (typeof id === 'string' && id.startsWith('CH')) {
            id = parseInt(id.substring(2));
        }
        
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                d.name AS driver_name,
                s.driver_id,
                b.bus_number,
                s.bus_id,
                r.route_name,
                s.route_id,
                DATE_FORMAT(s.date, '%Y-%m-%d') as date,
                s.shift_type,
                s.shift_number,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                'Điểm bắt đầu' as start_point,
                'Điểm kết thúc' as end_point,
                60 as estimated_duration,
                s.student_count,
                25 as max_capacity,
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

        // Format response để đồng bộ
        const schedule = {
            ...rows[0],
            id: `CH${String(rows[0].id).padStart(3, '0')}`,
            schedule_id: rows[0].id,
            shift_display: rows[0].shift_type === 'morning' ? `Ca ${rows[0].shift_number} - Sáng` : 
                          rows[0].shift_type === 'afternoon' ? `Ca ${rows[0].shift_number} - Chiều` :
                          `Ca ${rows[0].shift_number}`
        };

        res.json({
            success: true,
            data: schedule
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
        if (!driver_id || !bus_id || !route_id || !date || !shift_type || !shift_number || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO schedules (
                driver_id, bus_id, route_id, date, shift_type, shift_number,
                scheduled_start_time, scheduled_end_time, student_count, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `, [
            driver_id, bus_id, route_id, date, shift_type, shift_number,
            start_time, end_time, student_count || 0, notes || null
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
        let { id } = req.params;
        
        // Xử lý ID format - nếu là "CH001" thì lấy số 1
        if (typeof id === 'string' && id.startsWith('CH')) {
            id = parseInt(id.substring(2));
        }
        
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
                scheduled_start_time = ?, scheduled_end_time = ?, student_count = ?, status = ?, notes = ?
            WHERE id = ?
        `, [
            driver_id, bus_id, route_id, date, shift_type, shift_number,
            start_time, end_time, student_count || 0, status || 'scheduled', notes || null,
            id
        ]);

        // Get updated schedule với format mới
        const [updatedSchedule] = await pool.execute('SELECT * FROM schedules WHERE id = ?', [id]);
        const formattedSchedule = {
            ...updatedSchedule[0],
            id: `CH${String(updatedSchedule[0].id).padStart(3, '0')}`,
            schedule_id: updatedSchedule[0].id
        };

        res.json({
            success: true,
            message: 'Cập nhật lịch trình thành công',
            data: formattedSchedule
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
        let { id } = req.params;

        // Xử lý ID format - nếu là "CH001" thì lấy số 1
        if (typeof id === 'string' && id.startsWith('CH')) {
            id = parseInt(id.substring(2));
        }

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
