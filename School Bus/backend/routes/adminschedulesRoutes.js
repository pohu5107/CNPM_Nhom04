// /backend/routes/adminSchedulesRoutes.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Helper function to check schedule conflicts
async function checkScheduleConflicts(driver_id, bus_id, route_id, date, shift_type, excludeId = null) {
    const conflicts = [];
    
    // Check driver conflict
    let driverQuery = `
        SELECT id FROM schedules 
        WHERE driver_id = ? AND date = ? AND shift_type = ?
    `;
    let driverParams = [driver_id, date, shift_type];
    
    if (excludeId) {
        driverQuery += ' AND id != ?';
        driverParams.push(excludeId);
    }
    
    const [driverConflict] = await pool.execute(driverQuery, driverParams);
    if (driverConflict.length > 0) {
        conflicts.push({
            type: 'DRIVER_CONFLICT',
            message: `Tài xế đã có lịch trình khác vào ${date} ca ${shift_type === 'morning' ? 'sáng' : 'chiều'}`
        });
    }
    
    // Check bus conflict  
    let busQuery = `
        SELECT id FROM schedules 
        WHERE bus_id = ? AND date = ? AND shift_type = ?
    `;
    let busParams = [bus_id, date, shift_type];
    
    if (excludeId) {
        busQuery += ' AND id != ?';
        busParams.push(excludeId);
    }
    
    const [busConflict] = await pool.execute(busQuery, busParams);
    if (busConflict.length > 0) {
        conflicts.push({
            type: 'BUS_CONFLICT',
            message: `Xe bus đã có lịch trình khác vào ${date} ca ${shift_type === 'morning' ? 'sáng' : 'chiều'}`
        });
    }
    
    // Check route conflict
    let routeQuery = `
        SELECT id FROM schedules 
        WHERE route_id = ? AND date = ? AND shift_type = ?
    `;
    let routeParams = [route_id, date, shift_type];
    if (excludeId) {
        routeQuery += ' AND id != ?';
        routeParams.push(excludeId);
    }

    const [routeConflict] = await pool.execute(routeQuery, routeParams);
    if (routeConflict.length > 0) {
        conflicts.push({
            type: 'ROUTE_CONFLICT',
            message: `Tuyến đã có lịch trình khác vào ${date} ca ${shift_type === 'morning' ? 'sáng' : 'chiều'}`
        });
    }
    
    return conflicts;
}

// GET /api/admin-schedules - Lấy danh sách tất cả lịch trình
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
                s.student_count,
                s.status,
                s.notes
            FROM schedules s
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            ORDER BY s.date DESC, s.scheduled_start_time ASC
        `);

        const formattedRows = rows.map(row => ({
            ...row,
            id: `CH${String(row.id).padStart(3, '0')}`,
            schedule_id: row.id,
            shift_display: row.shift_type === 'morning' ? 'Ca Sáng' : 'Ca Chiều'
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

// GET /api/admin-schedules/:id - Lấy thông tin một lịch trình
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
                s.driver_id,
                s.bus_id,
                s.route_id,
                d.name AS driver_name,
                b.bus_number,
                r.route_name,
                DATE_FORMAT(s.date, '%Y-%m-%d') as date,
                s.shift_type,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                s.student_count,
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

        const schedule = {
            ...rows[0],
            id: `CH${String(rows[0].id).padStart(3, '0')}`,
            schedule_id: rows[0].id,
            shift_display: rows[0].shift_type === 'morning' ? 'Ca Sáng' : 'Ca Chiều'
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

// POST /api/admin-schedules - Thêm lịch trình mới
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
            student_count,
            notes
        } = req.body;

        // Validate required fields
        if (!driver_id || !bus_id || !route_id || !date || !shift_type || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

    // Check for conflicts before inserting
    const conflicts = await checkScheduleConflicts(driver_id, bus_id, route_id, date, shift_type, null);
        if (conflicts.length > 0) {
            return res.status(409).json({
                success: false,
                message: conflicts[0].type,
                details: conflicts[0].message
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

// PUT /api/admin-schedules/:id - Cập nhật lịch trình
router.put('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        
        // Xử lý ID format
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
            student_count,
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

    // Check for conflicts before updating
    const conflicts = await checkScheduleConflicts(driver_id, bus_id, route_id, date, shift_type, id);
        if (conflicts.length > 0) {
            return res.status(409).json({
                success: false,
                message: conflicts[0].type,
                details: conflicts[0].message
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

// DELETE /api/admin-schedules/:id - Xóa lịch trình
router.delete('/:id', async (req, res) => {
    try {
        let { id } = req.params;

        // Xử lý ID format
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