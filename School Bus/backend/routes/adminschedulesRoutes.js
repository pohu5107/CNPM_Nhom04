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
                s.driver_id,
                s.bus_id, 
                s.route_id,
                d.name AS driver_name,
                b.bus_number,
                b.license_plate,
                r.route_name,
                DATE_FORMAT(s.date, '%Y-%m-%d') as date,
                s.shift_type,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                COALESCE(start_stop.name, 'Điểm bắt đầu') as start_point,
                COALESCE(end_stop.name, 'Điểm kết thúc') as end_point,
                60 as estimated_duration,
                s.student_count,
                25 as max_capacity,
                s.status,
                s.notes
            FROM schedules s
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN (
                SELECT rs.route_id, st.name
                FROM route_stops rs
                JOIN stops st ON rs.stop_id = st.id
                WHERE rs.stop_order = 0
            ) start_stop ON start_stop.route_id = s.route_id
            LEFT JOIN (
                SELECT rs.route_id, st.name  
                FROM route_stops rs
                JOIN stops st ON rs.stop_id = st.id
                WHERE rs.stop_order = 99
            ) end_stop ON end_stop.route_id = s.route_id
            ORDER BY s.date DESC, s.shift_type
        `);

        // Format data để đồng bộ với driver format
        const formattedRows = rows.map(row => ({
            ...row,
            id: `CH${String(row.id).padStart(3, '0')}`, // Format giống driver
            schedule_id: row.id, // Giữ ID gốc để CRUD
            shift_display: row.shift_type === 'morning' ? 'Ca Sáng' : 
                          row.shift_type === 'afternoon' ? 'Ca Chiều' :
                          row.shift_type === 'evening' ? 'Ca Tối' : 'Ca khác'
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
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                r.start_point,
                r.end_point,
                r.estimated_duration,
                s.student_count,
                r.max_capacity,
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
            shift_display: rows[0].shift_type === 'morning' ? 'Ca Sáng' : 
                          rows[0].shift_type === 'afternoon' ? 'Ca Chiều' :
                          rows[0].shift_type === 'evening' ? 'Ca Tối' : 'Ca khác'
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

// POST /api/admin-schedules/check-conflict - Kiểm tra xung đột lịch trình
router.post('/check-conflict', async (req, res) => {
    try {
        const { driver_id, bus_id, route_id, date, shift_type } = req.body;
        
        if (!driver_id || !bus_id || !route_id || !date || !shift_type) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết để kiểm tra xung đột'
            });
        }

        const [conflicts] = await pool.execute(`
            SELECT 
                s.id,
                d.name as driver_name,
                b.license_plate,
                r.route_name,
                s.shift_type,
                s.date,
                CASE 
                    WHEN s.driver_id = ? THEN 'driver'
                    WHEN s.bus_id = ? THEN 'bus' 
                    WHEN s.route_id = ? THEN 'route'
                END as conflict_type
            FROM schedules s
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE (s.driver_id = ? OR s.bus_id = ? OR s.route_id = ?) 
            AND s.date = ? AND s.shift_type = ?
        `, [driver_id, bus_id, route_id, driver_id, bus_id, route_id, date, shift_type]);

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            const shiftText = shift_type === 'morning' ? 'sáng' : 
                             shift_type === 'afternoon' ? 'chiều' : 'tối';
            
            return res.json({
                success: false,
                has_conflict: true,
                message: `Xung đột lịch trình cho ca ${shiftText} ngày ${date}`,
                conflicts: conflicts
            });
        }

        res.json({
            success: true,
            has_conflict: false,
            message: 'Không có xung đột'
        });
    } catch (error) {
        console.error('Error checking conflict:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi kiểm tra xung đột',
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
        if (!driver_id || !bus_id || !route_id || !date || !shift_type || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        // Kiểm tra xung đột lịch trình trước khi tạo
        const [existingSchedules] = await pool.execute(`
            SELECT 
                s.id,
                d.name as driver_name,
                b.license_plate,
                r.route_name,
                s.shift_type,
                s.date
            FROM schedules s
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE (s.driver_id = ? OR s.bus_id = ? OR s.route_id = ?) 
            AND s.date = ? AND s.shift_type = ?
        `, [driver_id, bus_id, route_id, date, shift_type]);

        if (existingSchedules.length > 0) {
            const conflict = existingSchedules[0];
            let conflictType = '';
            let conflictDetail = '';
            
            if (conflict.driver_id == driver_id) {
                conflictType = 'tài xế';
                conflictDetail = `Tài xế ${conflict.driver_name} đã được phân công`;
            } else if (conflict.bus_id == bus_id) {
                conflictType = 'xe buýt';
                conflictDetail = `Xe buýt ${conflict.license_plate} đã được sử dụng`;
            } else if (conflict.route_id == route_id) {
                conflictType = 'tuyến đường';
                conflictDetail = `Tuyến ${conflict.route_name} đã có lịch trình`;
            }
            
            const shiftText = shift_type === 'morning' ? 'sáng' : 
                             shift_type === 'afternoon' ? 'chiều' : 'tối';
            
            return res.status(409).json({
                success: false,
                message: `Xung đột lịch trình: ${conflictDetail} cho ca ${shiftText} ngày ${date}`,
                conflict: {
                    type: conflictType,
                    existing_schedule: conflict
                }
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO schedules (
                driver_id, bus_id, route_id, date, shift_type,
                scheduled_start_time, scheduled_end_time, student_count, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `, [
            driver_id, bus_id, route_id, date, shift_type,
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
        
        // Xử lý lỗi constraint database
        if (error.code === 'ER_DUP_ENTRY') {
            let message = 'Xung đột lịch trình: ';
            
            if (error.message.includes('unique_driver_date_shift')) {
                message += 'Tài xế đã được phân công cho ca này trong ngày đã chọn';
            } else if (error.message.includes('unique_bus_date_shift')) {
                message += 'Xe buýt đã được sử dụng cho ca này trong ngày đã chọn';
            } else if (error.message.includes('unique_route_date_shift')) {
                message += 'Tuyến đường đã có lịch trình cho ca này trong ngày đã chọn';
            } else {
                message += 'Dữ liệu đã tồn tại trong hệ thống';
            }
            
            return res.status(409).json({
                success: false,
                message: message,
                suggestion: 'Vui lòng chọn tài xế, xe buýt hoặc tuyến khác, hoặc chọn ngày/ca khác'
            });
        }
        
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
                driver_id = ?, bus_id = ?, route_id = ?, date = ?, shift_type = ?,
                scheduled_start_time = ?, scheduled_end_time = ?, student_count = ?, status = ?, notes = ?
            WHERE id = ?
        `, [
            driver_id, bus_id, route_id, date, shift_type,
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
