// /backend/routes/schedulesRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/schedules/driver/:driverId/summary - Lấy thống kê tổng quan cho driver
router.get('/driver/:driverId/summary', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { date } = req.query;
        
        let dateCondition = 'AND s.date = CURDATE()';
        let params = [driverId];
        
        if (date) {
            dateCondition = 'AND s.date = ?';
            params.push(date);
        }
        
        const [summary] = await pool.execute(`
            SELECT 
                COUNT(*) as total_shifts,
                SUM(CASE WHEN s.status = 'scheduled' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN s.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN s.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM schedules s
            WHERE s.driver_id = ? ${dateCondition}
        `, params);
        
        res.json({
            success: true,
            data: summary[0] || {
                total_shifts: 0,
                pending: 0,
                in_progress: 0,
                completed: 0,
                cancelled: 0
            }
        });
    } catch (error) {
        console.error('Error fetching driver summary:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê tổng quan',
            error: error.message
        });
    }
});

// GET /api/schedules/driver/:driverId - Lấy danh sách lịch làm việc của tài xế
router.get('/driver/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { date, timeFilter } = req.query;
        
        let dateCondition = '';
        let params = [driverId];
        
        if (date) {
            dateCondition = 'AND s.date = ?';
            params.push(date);
        } else if (timeFilter) {
            switch (timeFilter) {
                case 'week':
                    dateCondition = 'AND s.date >= CURDATE() AND s.date <= DATE_ADD(CURDATE(), INTERVAL 6 DAY)';
                    break;
                case 'month':
                    dateCondition = 'AND MONTH(s.date) = MONTH(CURDATE()) AND YEAR(s.date) = YEAR(CURDATE())';
                    break;
                case 'all':
                    dateCondition = 'AND s.date >= CURDATE()';
                    break;
                default: // today
                    dateCondition = 'AND s.date = CURDATE()';
            }
        }
        
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                DATE_FORMAT(s.date, '%Y-%m-%d') as date,
                s.shift_type,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                COALESCE(start_stop.name, 'Điểm bắt đầu') as start_point,
                COALESCE(end_stop.name, 'Điểm kết thúc') as end_point,
                s.student_count,
                25 as max_capacity,
                s.status,
                s.notes,
                60 as estimated_duration,
                b.bus_number,
                b.license_plate,
                r.route_name,
                r.distance,
                CONCAT(d.name) as driver_name,
                COALESCE(stops_count.total_stops, 0) as stop_count
            FROM schedules s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN route_stops start_rs ON r.id = start_rs.route_id AND start_rs.stop_order = 0
            LEFT JOIN stops start_stop ON start_rs.stop_id = start_stop.id
            LEFT JOIN route_stops end_rs ON r.id = end_rs.route_id AND end_rs.stop_order = 99
            LEFT JOIN stops end_stop ON end_rs.stop_id = end_stop.id
            LEFT JOIN (
                SELECT route_id, COUNT(*) as total_stops
                FROM route_stops 
                GROUP BY route_id
            ) stops_count ON r.id = stops_count.route_id
            WHERE s.driver_id = ? ${dateCondition}
            ORDER BY s.date DESC, s.scheduled_start_time ASC
        `, params);
        
        const schedules = rows.map(row => ({
            id: row.id,
            date: row.date,
            ca: row.shift_type === 'morning' ? 'Sáng' : 
                row.shift_type === 'afternoon' ? 'Chiều' : 'Tối',
            time: `${row.start_time?.substring(0, 5)} - ${row.end_time?.substring(0, 5)}`,
            route: row.route_name,
            busNumber: row.license_plate,
            startPoint: row.start_point,
            endPoint: row.end_point,
            stopCount: row.stop_count,
            studentCount: `${row.student_count || 0}/${row.max_capacity}`,
            actualStudentCount: row.student_count || 0,
            status: row.status,
            statusText: getStatusText(row.status),
            statusColor: getStatusColor(row.status),
            notes: row.notes,
            estimatedDuration: row.estimated_duration
        }));
        
        res.json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Error fetching driver schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch làm việc',
            error: error.message
        });
    }
});

// GET /api/schedules/:driverId?period=today|week|month|all - Lấy danh sách lịch làm việc của tài xế (legacy)
router.get('/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { period } = req.query;
        
        let dateCondition = '';
        let params = [driverId];
        
        if (period) {
            switch (period) {
                case 'week':
                    dateCondition = 'AND s.date >= CURDATE() AND s.date <= DATE_ADD(CURDATE(), INTERVAL 6 DAY)';
                    break;
                case 'month':
                    dateCondition = 'AND MONTH(s.date) = MONTH(CURDATE()) AND YEAR(s.date) = YEAR(CURDATE())';
                    break;
                case 'all':
                    dateCondition = 'AND s.date >= CURDATE()';
                    break;
                default:
                    dateCondition = 'AND s.date = CURDATE()';
            }
        }
        
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                DATE_FORMAT(s.date, '%Y-%m-%d') as date,
                s.shift_type,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                COALESCE(start_stop.name, 'Điểm bắt đầu') as start_point,
                COALESCE(end_stop.name, 'Điểm kết thúc') as end_point,
                s.student_count,
                25 as max_capacity,
                s.status,
                s.notes,
                60 as estimated_duration,
                b.bus_number,
                b.license_plate,
                r.route_name,
                r.distance,
                d.name as driver_name,
                COUNT(DISTINCT rs.id) as actual_stop_count
            FROM schedules s
            INNER JOIN buses b ON s.bus_id = b.id
            INNER JOIN routes r ON s.route_id = r.id
            INNER JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN route_stops rs ON s.route_id = rs.route_id AND rs.stop_order BETWEEN 1 AND 98
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
            WHERE s.driver_id = ? ${dateCondition}
            GROUP BY s.id, s.route_id
            ORDER BY s.date ASC, s.scheduled_start_time ASC
        `, params);
        
        // Format dữ liệu cho frontend
        const formattedSchedules = rows.map(schedule => {
            // Xác định loại ca dựa trên shift_type
            let caText = '';
            if (schedule.shift_type) {
                caText = schedule.shift_type === 'morning' ? 'Ca Sáng' : 
                        schedule.shift_type === 'afternoon' ? 'Ca Chiều' :
                        schedule.shift_type === 'evening' ? 'Ca Tối' : 'Ca khác';
            } else {
                // Fallback: dựa vào thời gian để xác định
                const startHour = parseInt(schedule.start_time.split(':')[0]);
                if (startHour >= 6 && startHour < 12) {
                    caText = 'Ca Sáng';
                } else if (startHour >= 12 && startHour < 18) {
                    caText = 'Ca Chiều';
                } else {
                    caText = 'Ca Tối';
                }
            }
            
            return {
                id: `CH${String(schedule.id).padStart(3, '0')}`,
                ca: caText, // Hiển thị ca với loại (sáng/chiều)
                shiftType: schedule.shift_type, // Thêm thông tin loại ca
                time: `${schedule.start_time.substring(0, 5)} - ${schedule.end_time.substring(0, 5)}`,
                route: schedule.route_name,
                busNumber: schedule.license_plate,
                startPoint: schedule.start_point,
                endPoint: schedule.end_point,
                stopCount: schedule.actual_stop_count || 0, // Số điểm dừng thực tế từ route_stops
                studentCount: `${schedule.student_count}/${schedule.max_capacity}`, // Sử dụng student_count đã cập nhật từ DB
                actualStudentCount: schedule.student_count, // Để sử dụng trong frontend
                status: schedule.status,
                statusText: getStatusText(schedule.status),
                statusColor: getStatusColor(schedule.status)
            };
        });

        res.json({
            success: true,
            data: formattedSchedules,
            count: formattedSchedules.length
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách lịch làm việc',
            error: error.message
        });
    }
});

// GET /api/schedules/:driverId/:id - Lấy chi tiết một lịch làm việc
router.get('/:driverId/:id', async (req, res) => {
    try {
        const { driverId, id } = req.params;
        
        const [rows] = await pool.execute(`
            SELECT 
                s.*,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                COALESCE(start_stop.name, 'Điểm bắt đầu') as start_point,
                COALESCE(end_stop.name, 'Điểm kết thúc') as end_point,
                b.bus_number,
                b.license_plate,
                b.status as bus_status,
                r.route_name,
                r.distance,
                d.name as driver_name,
                d.phone as driver_phone,
                d.license_number as driver_license
            FROM schedules s
            INNER JOIN buses b ON s.bus_id = b.id
            INNER JOIN routes r ON s.route_id = r.id
            INNER JOIN drivers d ON s.driver_id = d.id
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
            WHERE s.id = ? AND s.driver_id = ?
            LIMIT 1
        `, [id, driverId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc'
            });
        }

        // Lấy danh sách học sinh cho lịch này - logic mới đơn giản hơn
        const schedule = rows[0];
        
        // Tìm học sinh dựa trên route_id của schedule và shift_type
        const [students] = await pool.execute(`
            SELECT 
                st.id,
                st.name,
                st.grade,
                st.class,
                st.address,
                st.pickup_time,
                st.dropoff_time,
                p.name as parent_name,
                p.phone as parent_phone
            FROM students st
            LEFT JOIN parents p ON st.parent_id = p.id
            WHERE (
                (? = 'morning' AND st.morning_route_id = ?) OR
                (? = 'afternoon' AND st.afternoon_route_id = ?) OR
                (? NOT IN ('morning', 'afternoon') AND (st.morning_route_id = ? OR st.afternoon_route_id = ?))
            ) AND st.status = 'active'
            ORDER BY st.pickup_time ASC
        `, [schedule.shift_type, schedule.route_id, schedule.shift_type, schedule.route_id, schedule.shift_type, schedule.route_id, schedule.route_id]);
        
        const detailData = {
            ...schedule,
            statusText: getStatusText(schedule.status),
            statusColor: getStatusColor(schedule.status),
            students: students,
            studentCount: students.length, // Số học sinh thực tế từ database
            original_student_count: schedule.student_count // Giữ lại giá trị gốc từ schedule
        };
        
        res.json({
            success: true,
            data: detailData
        });
    } catch (error) {
        console.error('Error fetching schedule detail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết lịch làm việc',
            error: error.message
        });
    }
});

// POST /api/schedules/:driverId/:id/start - Bắt đầu chuyến
router.post('/:driverId/:id/start', async (req, res) => {
    try {
        const { driverId, id } = req.params;
        
        // Kiểm tra lịch có tồn tại và thuộc về tài xế không
        const [existing] = await pool.execute(
            'SELECT id, status FROM schedules WHERE id = ? AND driver_id = ?',
            [id, driverId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc'
            });
        }
        
        if (existing[0].status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể bắt đầu lịch làm việc có trạng thái "scheduled"'
            });
        }
        
        // Cập nhật trạng thái và thời gian bắt đầu thực tế
        await pool.execute(`
            UPDATE schedules 
            SET status = 'in_progress', actual_start_time = NOW()
            WHERE id = ? AND driver_id = ?
        `, [id, driverId]);
        
        res.json({
            success: true,
            message: 'Đã bắt đầu chuyến thành công'
        });
    } catch (error) {
        console.error('Error starting schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi bắt đầu chuyến',
            error: error.message
        });
    }
});

// POST /api/schedules/:driverId/:id/complete - Hoàn thành chuyến
router.post('/:driverId/:id/complete', async (req, res) => {
    try {
        const { driverId, id } = req.params;
        const { notes } = req.body;
        
        // Kiểm tra lịch có tồn tại và thuộc về tài xế không
        const [existing] = await pool.execute(
            'SELECT id, status FROM schedules WHERE id = ? AND driver_id = ?',
            [id, driverId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc'
            });
        }
        
        if (existing[0].status !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể hoàn thành lịch làm việc đang thực hiện'
            });
        }
        
        // Cập nhật trạng thái và thời gian hoàn thành thực tế
        await pool.execute(`
            UPDATE schedules 
            SET status = 'completed', actual_end_time = NOW(), notes = ?
            WHERE id = ? AND driver_id = ?
        `, [notes || null, id, driverId]);
        
        res.json({
            success: true,
            message: 'Đã hoàn thành chuyến thành công'
        });
    } catch (error) {
        console.error('Error completing schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi hoàn thành chuyến',
            error: error.message
        });
    }
});

// GET /api/schedules/driver/:driverId/stops/:scheduleId - Lấy danh sách điểm dừng cho driver
router.get('/driver/:driverId/stops/:scheduleId', async (req, res) => {
    try {
        const { driverId, scheduleId } = req.params;
        
        // Lấy thông tin schedule và route
        const [scheduleRows] = await pool.execute(`
            SELECT 
                s.id as schedule_id,
                s.shift_type,
                s.scheduled_start_time,
                s.date,
                s.route_id,
                r.route_name
            FROM schedules s
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE s.id = ? AND s.driver_id = ?
        `, [scheduleId, driverId]);
        
        if (scheduleRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc'
            });
        }
        
        const schedule = scheduleRows[0];
        const startTime = schedule.scheduled_start_time;
        
        // Lấy danh sách điểm dừng theo thứ tự
        const [stops] = await pool.execute(`
            SELECT 
                rs.id,
                rs.stop_order as \`order\`,
                s.name,
                s.address,
                rs.estimated_arrival_time,
                s.latitude,
                s.longitude
            FROM route_stops rs
            INNER JOIN stops s ON rs.stop_id = s.id
            WHERE rs.route_id = ?
            ORDER BY rs.stop_order ASC
        `, [schedule.route_id]);
        
        // Tính toán thời gian dự kiến cho từng điểm dừng
        const processedStops = stops.map((stop, index) => {
            let estimatedTime = startTime; // Default fallback
            
            if (stop.estimated_arrival_time) {
                // estimated_arrival_time là offset từ thời điểm bắt đầu  
                // Parse start time
                const [startHours, startMinutes] = startTime.split(':').map(Number);
                
                // Parse offset time
                const offsetStr = stop.estimated_arrival_time.toString();
                const [offsetHours, offsetMinutes] = offsetStr.split(':').map(Number);
                
                // Calculate final time
                let totalMinutes = (startHours * 60 + startMinutes) + (offsetHours * 60 + offsetMinutes);
                const finalHours = Math.floor(totalMinutes / 60) % 24;
                const finalMins = totalMinutes % 60;
                
                estimatedTime = `${finalHours.toString().padStart(2, '0')}:${finalMins.toString().padStart(2, '0')}`;
            } else {
                // Tự động tính thời gian dựa trên startTime + offset theo thứ tự
                const startDateTime = new Date(`1970-01-01T${startTime}:00`);
                
                if (stop.order === 0) {
                    // Điểm xuất phát = thời gian bắt đầu
                    estimatedTime = startTime;
                } else if (stop.order === 99) {
                    // Điểm kết thúc = thời gian kết thúc schedule 
                    const endDateTime = new Date(`1970-01-01T${startTime}:00`);
                    endDateTime.setHours(endDateTime.getHours() + 1); // Giả sử toàn tuyến mất 1h
                    estimatedTime = endDateTime.toTimeString().substring(0, 5);
                } else {
                    // Điểm dừng = startTime + (thứ tự * 15 phút)
                    startDateTime.setMinutes(startDateTime.getMinutes() + (stop.order * 15));
                    estimatedTime = startDateTime.toTimeString().substring(0, 5);
                }
            }
            
            const displayOrder = stop.order === 0 ? 'Bắt đầu' : 
                               stop.order === 99 ? 'Kết thúc' : 
                               stop.order;
            
            const type = stop.order === 0 ? 'Xuất phát' :
                        stop.order === 99 ? 'Kết thúc' : 'Điểm dừng';
            
            return {
                id: stop.id,
                order: stop.order,
                displayOrder: displayOrder,
                name: stop.name,
                address: stop.address,
                type: type,
                estimatedTime: estimatedTime,
                latitude: stop.latitude,
                longitude: stop.longitude,
                status: 'pending', // Mặc định chưa đến
                note: ''
            };
        });
        
        res.json({
            success: true,
            data: {
                scheduleId: schedule.schedule_id,
                routeId: schedule.route_id,
                routeName: schedule.route_name,
                totalStops: stops.length,
                stops: processedStops
            }
        });
    } catch (error) {
        console.error('Error fetching driver schedule stops:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách điểm dừng',
            error: error.message
        });
    }
});

// GET /api/schedules/:driverId/:id/stops - Lấy danh sách điểm dừng của lịch (legacy)
router.get('/:driverId/:id/stops', async (req, res) => {
    try {
        const { driverId, id } = req.params;
        
        // Lấy thông tin schedule để biết route_id
        const [scheduleRows] = await pool.execute(`
            SELECT s.route_id, s.scheduled_start_time as start_time, s.date, r.route_name
            FROM schedules s
            INNER JOIN routes r ON s.route_id = r.id
            WHERE s.id = ? AND s.driver_id = ?
        `, [id, driverId]);
        
        if (scheduleRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc'
            });
        }
        
        const schedule = scheduleRows[0];
        
        // Lấy danh sách stops của route này
        const [stops] = await pool.execute(`
            SELECT 
                rs.route_id,
                rs.stop_id,
                rs.stop_order,
                rs.estimated_arrival_time,
                st.name as stop_name,
                st.address as stop_address,
                st.latitude,
                st.longitude
            FROM route_stops rs
            INNER JOIN stops st ON rs.stop_id = st.id
            WHERE rs.route_id = ?
            ORDER BY rs.stop_order ASC
        `, [schedule.route_id]);
        
        // Format dữ liệu cho frontend
        const formattedStops = stops.map((stop, index) => {
            // Tính thời gian dự kiến dựa trên estimated_arrival_time hoặc start_time + offset
            let estimatedTime = schedule.start_time;
            if (stop.estimated_arrival_time) {
                estimatedTime = stop.estimated_arrival_time;
            } else {
                // Tính toán dựa trên start_time + (index * 5 phút)
                const startTime = new Date(`${schedule.date} ${schedule.start_time}`);
                startTime.setMinutes(startTime.getMinutes() + (index * 5));
                estimatedTime = startTime.toTimeString().substring(0, 5);
            }
            
            return {
                routeId: stop.route_id,
                stopId: stop.stop_id,
                order: stop.stop_order,
                displayOrder: stop.stop_order === 0 ? 'Bắt đầu' : 
                            stop.stop_order === 99 ? 'Kết thúc' : 
                            stop.stop_order,
                name: stop.stop_name,
                address: stop.stop_address,
                type: stop.stop_order === 0 ? 'Điểm bắt đầu' :
                      stop.stop_order === 99 ? 'Điểm kết thúc' : 'Điểm dừng',
                estimatedTime: estimatedTime,
                status: 'pending', // Có thể cập nhật logic status từ attendance table
                note: null,
                latitude: stop.latitude,
                longitude: stop.longitude
            };
        });
        
        res.json({
            success: true,
            data: {
                scheduleId: id,
                routeId: schedule.route_id,
                routeName: schedule.route_name,
                stops: formattedStops
            }
        });
    } catch (error) {
        console.error('Error fetching schedule stops:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách điểm dừng',
            error: error.message
        });
    }
});

// GET /api/admin-schedules - Lấy danh sách tất cả lịch trình (cho admin)
router.get('/admin-schedules', async (req, res) => {
    try {
        const { date } = req.query;
        
        let dateCondition = '';
        let params = [];
        
        if (date) {
            dateCondition = 'WHERE s.date = ?';
            params.push(date);
        } else {
            // Mặc định lấy schedules từ ngày hiện tại
            dateCondition = 'WHERE s.date >= CURDATE()';
        }
        
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                s.date,
                s.shift_type,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                'Điểm bắt đầu' as start_point,
                'Điểm kết thúc' as end_point,
                s.status,
                d.name as driver_name,
                b.bus_number,
                b.license_plate,
                r.route_name,
                s.student_count,
                25 as max_capacity
            FROM schedules s
            INNER JOIN drivers d ON s.driver_id = d.id
            INNER JOIN buses b ON s.bus_id = b.id
            INNER JOIN routes r ON s.route_id = r.id
            ${dateCondition}
            ORDER BY s.date ASC, s.scheduled_start_time ASC
        `, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Error fetching admin schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách lịch trình',
            error: error.message
        });
    }
});

// GET /api/schedules/:id/students-by-route - Lấy students của schedule theo route từ database (cập nhật logic mới)
router.get('/:id/students-by-route', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lấy thông tin schedule trước
        const [scheduleInfo] = await pool.execute(`
            SELECT s.route_id, r.route_name, s.shift_type
            FROM schedules s
            INNER JOIN routes r ON s.route_id = r.id
            WHERE s.id = ?
        `, [id]);
        
        if (scheduleInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch trình'
            });
        }
        
        const schedule = scheduleInfo[0];
        
        // Logic đơn giản hơn - sử dụng route_id của schedule
        // Lấy students thuộc route này từ database với thời gian từ schedule
        const [students] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class,
                c.class_name,
                sch.scheduled_start_time as pickup_time,  -- Dùng thời gian bắt đầu schedule làm giờ đón
                sch.scheduled_end_time as dropoff_time,   -- Dùng thời gian kết thúc schedule làm giờ trả  
                r.route_name,
                b.bus_number,
                b.license_plate,
                'Chưa đón' as status -- Mặc định status
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes r ON (
                (? = 'morning' AND s.morning_route_id = r.id) OR
                (? = 'afternoon' AND s.afternoon_route_id = r.id) OR
                (? NOT IN ('morning', 'afternoon') AND (s.morning_route_id = r.id OR s.afternoon_route_id = r.id))
            )
            INNER JOIN schedules sch ON sch.id = ? -- Lấy thời gian từ schedule hiện tại
            LEFT JOIN buses b ON sch.bus_id = b.id
            WHERE (
                (? = 'morning' AND s.morning_route_id = ?) OR
                (? = 'afternoon' AND s.afternoon_route_id = ?) OR
                (? NOT IN ('morning', 'afternoon') AND (s.morning_route_id = ? OR s.afternoon_route_id = ?))
            ) AND s.status = 'active'
            ORDER BY s.pickup_time ASC
        `, [schedule.shift_type, schedule.shift_type, schedule.shift_type, id, schedule.shift_type, schedule.route_id, schedule.shift_type, schedule.route_id, schedule.shift_type, schedule.route_id, schedule.route_id]);
        
        res.json({
            success: true,
            data: {
                scheduleInfo: {
                    route_id: schedule.route_id,
                    route_name: schedule.route_name,
                    shift_type: schedule.shift_type
                },
                students: students
            }
        });
    } catch (error) {
        console.error('Error fetching schedule students:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách học sinh',
            error: error.message
        });
    }
});

// Helper functions
function getStatusText(status) {
    switch (status) {
        case 'scheduled': return 'Đã lên lịch';
        case 'in_progress': return 'Đang thực hiện';
        case 'completed': return 'Hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return 'Không xác định';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'scheduled': return 'bg-blue-100 text-blue-700';
        case 'in_progress': return 'bg-yellow-100 text-yellow-700';
        case 'completed': return 'bg-green-100 text-green-700';
        case 'cancelled': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

export default router;