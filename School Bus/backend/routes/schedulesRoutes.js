// /backend/routes/schedulesRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/schedules/driver/:driverId - Lấy lịch làm việc của driver
router.get('/driver/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { date, timeFilter = 'today' } = req.query;
        
        let dateCondition = '';
        const params = [driverId];
        
        if (date) {
            dateCondition = 'AND s.date = ?';
            params.push(date);
        } else {
            // Xử lý timeFilter
            switch (timeFilter) {
                case 'today':
                    dateCondition = 'AND s.date = CURDATE()';
                    break;
                case 'week':
                    dateCondition = 'AND s.date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)';
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
                s.date,
                s.shift_type,
                s.shift_number,
                s.start_time,
                s.end_time,
                s.start_point,
                s.end_point,
                s.student_count,
                s.max_capacity,
                s.status,
                s.notes,
                s.estimated_duration,
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
            LEFT JOIN route_stops rs ON s.route_id = rs.route_id
            WHERE s.driver_id = ? ${dateCondition}
            GROUP BY s.id, s.route_id, s.bus_id
            ORDER BY s.date ASC, s.start_time ASC
        `, params);
        
        // Format dữ liệu cho frontend
        const formattedSchedules = rows.map(schedule => {
            // Xác định loại ca dựa trên thời gian và shift_type
            let caText = '';
            if (schedule.shift_type) {
                // Nếu có shift_type trong database
                caText = schedule.shift_type === 'morning' ? `Ca ${schedule.shift_number} - Sáng` : 
                        schedule.shift_type === 'afternoon' ? `Ca ${schedule.shift_number} - Chiều` :
                        `Ca ${schedule.shift_number}`;
            } else {
                // Fallback: dựa vào thời gian để xác định
                const startHour = parseInt(schedule.start_time.split(':')[0]);
                if (startHour >= 6 && startHour < 12) {
                    caText = `Ca ${schedule.shift_number} - Sáng`;
                } else if (startHour >= 12 && startHour < 18) {
                    caText = `Ca ${schedule.shift_number} - Chiều`;
                } else {
                    caText = `Ca ${schedule.shift_number} - Tối`;
                }
            }
            
            return {
                id: `CH${String(schedule.id).padStart(3, '0')}`,
                ca: caText, // Hiển thị ca với loại (sáng/chiều)
                caNumber: schedule.shift_number, // Giữ số ca để sort
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
                statusColor: getStatusColor(schedule.status),
                date: schedule.date,
                notes: schedule.notes,
                estimatedDuration: schedule.estimated_duration
            };
        });
        
        res.json({
            success: true,
            data: formattedSchedules,
            count: formattedSchedules.length
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

// GET /api/schedules/:id - Lấy chi tiết một lịch làm việc
router.get('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        
        // Xử lý ID format - nếu là "CH002" thì lấy số 2
        if (typeof id === 'string' && id.startsWith('CH')) {
            id = parseInt(id.substring(2));
        }
        
        const [rows] = await pool.execute(`
            SELECT 
                s.*,
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
            WHERE s.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc'
            });
        }
        
        // Lấy danh sách học sinh trên tuyến này
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
            WHERE st.route_id = ? AND st.bus_id = ? AND st.status = 'active'
            ORDER BY st.pickup_time ASC
        `, [rows[0].route_id, rows[0].bus_id]);
        
        const schedule = rows[0];
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

// PUT /api/schedules/:id/status - Cập nhật trạng thái lịch làm việc
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }
        
        await pool.execute(`
            UPDATE schedules 
            SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, notes || null, id]);
        
        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công'
        });
    } catch (error) {
        console.error('Error updating schedule status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái',
            error: error.message
        });
    }
});

// GET /api/schedules/driver/:driverId/summary - Lấy thống kê tổng quan
router.get('/driver/:driverId/summary', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { date = new Date().toISOString().split('T')[0] } = req.query;
        
        const [summary] = await pool.execute(`
            SELECT 
                COUNT(*) as total_shifts,
                SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(student_count) as total_students
            FROM schedules 
            WHERE driver_id = ? AND date = ?
        `, [driverId, date]);
        
        res.json({
            success: true,
            data: summary[0]
        });
    } catch (error) {
        console.error('Error fetching schedule summary:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê',
            error: error.message
        });
    }
});

// GET /api/schedules/driver/:driverId/stops/:scheduleId - Lấy danh sách điểm dừng thực tế
router.get('/driver/:driverId/stops/:scheduleId', async (req, res) => {
    try {
        let { scheduleId } = req.params;
        
        // Xử lý ID format - nếu là "CH002" thì lấy số 2
        if (typeof scheduleId === 'string' && scheduleId.startsWith('CH')) {
            scheduleId = parseInt(scheduleId.substring(2));
        }
        
        // Lấy thông tin schedule trước
        const [scheduleRows] = await pool.execute(`
            SELECT s.route_id, s.start_time, s.date, r.route_name
            FROM schedules s 
            INNER JOIN routes r ON s.route_id = r.id
            WHERE s.id = ?
        `, [scheduleId]);
        
        if (scheduleRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch trình'
            });
        }
        
        const schedule = scheduleRows[0];
        
        // Lấy danh sách điểm dừng và tính thời gian động dựa trên schedule start_time
        const [stops] = await pool.execute(`
            SELECT 
                rs.stop_order,
                rs.estimated_arrival_time as template_time,
                rs.student_pickup_count,
                s.name as stop_name,
                s.address as stop_address,
                s.latitude,
                s.longitude,
                'Đón học sinh' as stop_type
            FROM route_stops rs
            INNER JOIN stops s ON rs.stop_id = s.id
            WHERE rs.route_id = ?
            ORDER BY rs.stop_order ASC
        `, [schedule.route_id]);
        
        // Tính thời gian động cho điểm dừng dựa trên schedule start_time
        const scheduleStartTime = schedule.start_time;
        const [startHour, startMinute] = scheduleStartTime.split(':').map(Number);
        
        // Format dữ liệu cho frontend với thời gian được tính từ offset trong DB
        const formattedStops = stops.map((stop, index) => {
            // Lấy offset từ database (format HH:MM:SS được chuyển thành phút)
            const [offsetHour, offsetMinute] = stop.template_time.split(':').map(Number);
            const offsetMinutes = offsetHour * 60 + offsetMinute; // Chuyển offset thành phút
            
            // Tính thời gian thực tế = schedule start_time + offset từ DB
            const scheduleStartTotal = startHour * 60 + startMinute;
            const actualArrivalTotal = scheduleStartTotal + offsetMinutes;
            
            const actualHour = Math.floor(actualArrivalTotal / 60) % 24;
            const actualMinute = actualArrivalTotal % 60;
            const actualTimeString = `${String(actualHour).padStart(2, '0')}:${String(actualMinute).padStart(2, '0')}`;
            
            return {
                order: stop.stop_order,
                name: stop.stop_name,
                address: stop.stop_address,
                type: stop.stop_type,
                estimatedTime: actualTimeString, // Thời gian = start_time + offset từ DB
                studentCount: stop.student_pickup_count > 0 ? `${stop.student_pickup_count} học sinh` : '-',
                status: index === 0 ? 'current' : 'pending',
                coordinates: {
                    latitude: parseFloat(stop.latitude),
                    longitude: parseFloat(stop.longitude)
                },
                note: stop.student_pickup_count > 0 ? 
                     `Đón ${stop.student_pickup_count} học sinh` : 
                     'Điểm dừng trung gian'
            };
        });
        
        res.json({
            success: true,
            data: {
                scheduleId: scheduleId,
                routeId: schedule.route_id,
                routeName: schedule.route_name,
                totalStops: formattedStops.length,
                stops: formattedStops
            }
        });
        
    } catch (error) {
        console.error('Error fetching route stops:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách điểm dừng',
            error: error.message
        });
    }
});

// Helper functions
function getStatusText(status) {
    const statusMap = {
        'scheduled': '⏳ Chưa bắt đầu',
        'in_progress': '🚍 Đang chạy',
        'completed': '✅ Hoàn thành',
        'cancelled': '❌ Đã hủy'
    };
    return statusMap[status] || status;
}

function getStatusColor(status) {
    const colorMap = {
        'scheduled': 'bg-gray-100 text-gray-700',
        'in_progress': 'bg-blue-100 text-blue-700',
        'completed': 'bg-green-100 text-green-700',
        'cancelled': 'bg-red-100 text-red-700'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
}

// GET /api/schedules/admin - Lấy schedules cho admin với thông tin students thật từ database
router.get('/admin', async (req, res) => {
    try {
        const { date } = req.query;
        
        let dateCondition = '';
        const params = [];
        
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
                s.shift_number,
                s.start_time,
                s.end_time,
                s.start_point,
                s.end_point,
                s.status,
                d.name as driver_name,
                b.bus_number,
                b.license_plate,
                r.route_name,
                s.student_count,
                s.max_capacity
            FROM schedules s
            INNER JOIN drivers d ON s.driver_id = d.id
            INNER JOIN buses b ON s.bus_id = b.id
            INNER JOIN routes r ON s.route_id = r.id
            ${dateCondition}
            ORDER BY s.date ASC, s.start_time ASC
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

// GET /api/schedules/:id/students-by-route - Lấy students của schedule theo route từ database
router.get('/:id/students-by-route', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lấy thông tin schedule trước
        const [scheduleInfo] = await pool.execute(`
            SELECT s.route_id, r.route_name, s.shift_type, s.shift_number
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
        
        const routeId = scheduleInfo[0].route_id;
        
        // Lấy students thuộc route này từ database với thời gian từ schedule
        const [students] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class,
                c.class_name,
                sch.start_time as pickup_time,  -- Dùng thời gian bắt đầu schedule làm giờ đón
                sch.end_time as dropoff_time,   -- Dùng thời gian kết thúc schedule làm giờ trả  
                r.route_name,
                b.bus_number,
                b.license_plate,
                'Chưa đón' as status -- Mặc định status
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN buses b ON s.bus_id = b.id
            INNER JOIN schedules sch ON sch.id = ? -- Lấy thời gian từ schedule hiện tại
            WHERE s.route_id = ? AND s.status = 'active'
            ORDER BY s.name
        `, [id, routeId]);
        
        // Format dữ liệu cho frontend với thời gian từ schedule
        const formattedStudents = students.map(student => ({
            id: student.id,
            name: student.name,
            class: student.class_name || student.class,
            pickup: `Đón lúc ${student.pickup_time?.substring(0,5) || '06:30'}`, // Tất cả đón cùng lúc theo schedule
            drop: `Trả lúc ${student.dropoff_time?.substring(0,5) || '16:30'}`,   // Tất cả trả cùng lúc theo schedule
            status: student.status || 'Chưa đón'
        }));
        
        res.json({
            success: true,
            data: formattedStudents,
            count: formattedStudents.length,
            route_info: {
                route_name: scheduleInfo[0].route_name,
                shift_type: scheduleInfo[0].shift_type,
                shift_number: scheduleInfo[0].shift_number
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

export default router;