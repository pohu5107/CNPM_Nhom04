// /backend/routes/schedulesRoutes.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();



// GET /api/schedules/driver/:driverId - Lấy danh sách lịch làm việc của tài xế
router.get('/driver/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { date } = req.query;
        
        let dateCondition = '';
        let params = [driverId];
        
        if (date) {
            dateCondition = 'AND s.date = ?';
            params.push(date);
        }
        
        const [rows] = await pool.execute(`
            SELECT 
                s.id,
                DATE_FORMAT(s.date, '%Y-%m-%d') as date,
                s.shift_type,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                s.student_count,
                s.status,
                s.notes,
                s.route_id,
                COALESCE(b.license_plate, 'N/A') as license_plate,
                COALESCE(r.route_name, 'Tuyến chưa xác định') as route_name,
                COALESCE(r.distance, 0) as distance
            FROM schedules s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE s.driver_id = ? ${dateCondition}
            ORDER BY s.date DESC, s.scheduled_start_time ASC
        `, params);
        

        const data = rows.map(row => {
            return {
                id: row.id,
                date: row.date,
                ca: row.shift_type === 'morning' ? 'Sáng' : 'Chiều',
                time: `${row.start_time?.substring(0, 5)} - ${row.end_time?.substring(0, 5)}`,
                route: row.route_name,
                busNumber: row.license_plate,
                status: row.status || 'scheduled',
                statusText: row.status === 'scheduled' ? 'Chưa bắt đầu' : 
                           row.status === 'in_progress' ? 'Đang chạy' : 
                           row.status === 'completed' ? 'Hoàn thành' : 'Chưa bắt đầu',
                statusColor: row.status === 'scheduled' ? 'bg-gray-100 text-gray-700' : 
                            row.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                            row.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            };
        });
        
        res.json({
            success: true,
            data: data
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



// GET /api/schedules/:driverId/:id - Lấy chi tiết một lịch làm việc
router.get('/:driverId/:id', async (req, res) => {
    try {
        const { driverId, id } = req.params;
        console.log(' Fetching schedule detail with driverId:', driverId, 'and id:', id);
        
        const [rows] = await pool.execute(`
            SELECT 
                s.*,
                s.scheduled_start_time as start_time,
                s.scheduled_end_time as end_time,
                COALESCE(start_stop.name, 'Điểm bắt đầu') as start_point,
                COALESCE(end_stop.name, 'Điểm kết thúc') as end_point,
                b.license_plate,
                b.bus_number,
                r.route_name,
                COALESCE(stops_count.total_stops, 0) as stop_count,
                d.name as driver_name
            FROM schedules s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN route_stops start_rs ON r.id = start_rs.route_id AND start_rs.stop_order = 0
            LEFT JOIN stops start_stop ON start_rs.stop_id = start_stop.id
            LEFT JOIN route_stops end_rs ON r.id = end_rs.route_id AND end_rs.stop_order = 99
            LEFT JOIN stops end_stop ON end_rs.stop_id = end_stop.id
            LEFT JOIN (
                SELECT route_id, COUNT(*) as total_stops
                FROM route_stops
                GROUP BY route_id
            ) stops_count ON r.id = stops_count.route_id
            WHERE s.id = ? AND s.driver_id = ?
            LIMIT 1
        `, [id, driverId]);

        if (rows.length === 0) {
            console.log(' No schedule found for driverId:', driverId, 'and id:', id);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc'
            });
        }

        const schedule = rows[0];
        console.log(' Schedule found:', schedule.id);
        
        // Lấy danh sách học sinh
        const [students] = await pool.execute(`
            SELECT 
                st.id,
                st.name,
                st.grade,
                st.class,
                p.name as parent_name,
                p.phone as parent_phone
            FROM students st
            LEFT JOIN parents p ON st.parent_id = p.id
            WHERE (
                (? = 'morning' AND st.morning_route_id = ?) OR
                (? = 'afternoon' AND st.afternoon_route_id = ?)
            ) AND st.status = 'active'
            ORDER BY st.name ASC
        `, [schedule.shift_type, schedule.route_id, schedule.shift_type, schedule.route_id]);

        const detailData = {
            ...schedule,
            statusText: schedule.status === 'scheduled' ? 'Chưa bắt đầu' : 
                       schedule.status === 'in_progress' ? 'Đang chạy' : 
                       schedule.status === 'completed' ? 'Hoàn thành' : 'Chưa bắt đầu',
            statusColor: schedule.status === 'scheduled' ? 'bg-gray-100 text-gray-700' : 
                        schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                        schedule.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700',
            students: students,
            studentCount: students.length
        };

        res.json({
            success: true,
            data: detailData
        });
    } catch (error) {
   
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết lịch làm việc',
            error: error.message
        });
    }
});

// GET /api/schedules/driver/:driverId/stops/:scheduleId - Lấy danh sách điểm dừng cho driver
router.get('/driver/:driverId/stops/:scheduleId', async (req, res) => {
    try {
        const { driverId, scheduleId } = req.params;
        console.log(' Fetching stops with driverId:', driverId, 'and scheduleId:', scheduleId);

        // Lấy thông tin schedule
        const [scheduleRows] = await pool.execute(`
            SELECT 
                s.id as schedule_id,
                s.shift_type,
                s.scheduled_start_time,
                s.scheduled_end_time,
                s.route_id,
                r.route_name
            FROM schedules s
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE s.id = ? AND s.driver_id = ?
        `, [scheduleId, driverId]);

        if (scheduleRows.length === 0) {
            console.log(' No schedule found for driverId:', driverId, 'and scheduleId:', scheduleId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc'
            });
        }

        const schedule = scheduleRows[0];
        console.log(' Schedule found for stops:', schedule.schedule_id);

        // Lấy danh sách điểm dừng
        const [stops] = await pool.execute(`
            SELECT 
                rs.id,
                rs.stop_order as \`order\`,
                s.name,
                s.address,
                s.latitude,
                s.longitude
            FROM route_stops rs
            INNER JOIN stops s ON rs.stop_id = s.id
            WHERE rs.route_id = ?
            ORDER BY rs.stop_order ASC
        `, [schedule.route_id]);

        console.log(' Stops found:', stops.length);

        const startTime = schedule.scheduled_start_time;
        const endTime = schedule.scheduled_end_time;

        // Tính thời gian đơn giản: điểm đầu = start, điểm cuối = end, các điểm giữa chia đều
        const processedStops = stops.map((stop, index) => {
            let estimatedTime;
            
            if (stops.length === 1) {
                // Chỉ có 1 điểm thì = startTime
                estimatedTime = startTime?.substring(0, 5) || '00:00';
            } else if (index === 0) {
                // Điểm đầu = startTime
                estimatedTime = startTime?.substring(0, 5) || '00:00';
            } else if (index === stops.length - 1) {
                // Điểm cuối = endTime
                estimatedTime = endTime?.substring(0, 5) || startTime?.substring(0, 5) || '00:00';
            } else {
                // Các điểm giữa: phân bố đều giữa start và end
                if (startTime && endTime) {
                    const [sH, sM] = startTime.split(':').map(Number);
                    const [eH, eM] = endTime.split(':').map(Number);
                    const startMinutes = sH * 60 + sM;
                    const endMinutes = eH * 60 + eM;
                    const totalDiff = endMinutes - startMinutes;
                    const stepSize = totalDiff / (stops.length - 1);
                    const currentMinutes = startMinutes + Math.round(stepSize * index);
                    const h = Math.floor(currentMinutes / 60) % 24;
                    const m = currentMinutes % 60;
                    estimatedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                } else {
                    estimatedTime = startTime?.substring(0, 5) || '00:00';
                }
            }
            
            // Xác định loại điểm
            let displayOrder = stop.order;
            let type = 'Điểm dừng';
            
            if (stop.order === 0) {
                displayOrder = 'Bắt đầu';
                type = 'Xuất phát';
            } else if (stop.order === 99) {
                displayOrder = 'Kết thúc';
                type = 'Kết thúc';
            }

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
                status: 'scheduled',
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
        console.error(' Error fetching stops:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách điểm dừng',
            error: error.message
        });
    }
});


export default router;