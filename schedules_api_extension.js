// Backend API để lấy schedules với students thật từ database
// /backend/routes/schedulesRoutes.js

// GET /api/schedules - Lấy tất cả schedules cho admin
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        
        let dateCondition = '';
        const params = [];
        
        if (date) {
            dateCondition = 'WHERE s.date = ?';
            params.push(date);
        } else {
            // Mặc định lấy schedules từ hôm nay trở đi
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
                COUNT(ss.student_id) as actual_student_count,
                s.max_capacity
            FROM schedules s
            INNER JOIN drivers d ON s.driver_id = d.id
            INNER JOIN buses b ON s.bus_id = b.id
            INNER JOIN routes r ON s.route_id = r.id
            LEFT JOIN schedule_students ss ON s.id = ss.schedule_id
            ${dateCondition}
            GROUP BY s.id
            ORDER BY s.date ASC, s.start_time ASC
        `, params);
        
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

// GET /api/schedules/:id/students - Lấy danh sách students của một schedule
router.get('/:id/students', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.execute(`
            SELECT 
                st.id,
                st.name,
                st.grade,
                st.class,
                c.class_name,
                ss.pickup_stop_id,
                ss.dropoff_stop_id,
                ss.pickup_time,
                ss.dropoff_time,
                ss.status,
                pickup_stop.stop_name as pickup_stop_name,
                pickup_stop.address as pickup_address,
                dropoff_stop.stop_name as dropoff_stop_name,
                dropoff_stop.address as dropoff_address
            FROM schedule_students ss
            INNER JOIN students st ON ss.student_id = st.id
            LEFT JOIN classes c ON st.class_id = c.id
            LEFT JOIN stops pickup_stop ON ss.pickup_stop_id = pickup_stop.id
            LEFT JOIN stops dropoff_stop ON ss.dropoff_stop_id = dropoff_stop.id
            WHERE ss.schedule_id = ?
            ORDER BY st.name
        `, [id]);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
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

// POST /api/schedules/:id/assign-student - Phân công student vào schedule
router.post('/:id/assign-student', async (req, res) => {
    try {
        const { id: scheduleId } = req.params;
        const { student_id, pickup_stop_id, dropoff_stop_id } = req.body;
        
        // Kiểm tra schedule có tồn tại không
        const [scheduleCheck] = await pool.execute(
            'SELECT id, max_capacity FROM schedules WHERE id = ?',
            [scheduleId]
        );
        
        if (scheduleCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch trình'
            });
        }
        
        // Kiểm tra số lượng student hiện tại
        const [currentCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM schedule_students WHERE schedule_id = ?',
            [scheduleId]
        );
        
        if (currentCount[0].count >= scheduleCheck[0].max_capacity) {
            return res.status(400).json({
                success: false,
                message: 'Lịch trình đã đầy, không thể thêm học sinh'
            });
        }
        
        // Thêm student vào schedule
        await pool.execute(`
            INSERT INTO schedule_students (schedule_id, student_id, pickup_stop_id, dropoff_stop_id, status)
            VALUES (?, ?, ?, ?, 'not_picked')
        `, [scheduleId, student_id, pickup_stop_id, dropoff_stop_id]);
        
        res.json({
            success: true,
            message: 'Phân công học sinh thành công'
        });
    } catch (error) {
        console.error('Error assigning student:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi phân công học sinh',
            error: error.message
        });
    }
});

// DELETE /api/schedules/:id/remove-student/:studentId - Xóa student khỏi schedule
router.delete('/:id/remove-student/:studentId', async (req, res) => {
    try {
        const { id: scheduleId, studentId } = req.params;
        
        await pool.execute(
            'DELETE FROM schedule_students WHERE schedule_id = ? AND student_id = ?',
            [scheduleId, studentId]
        );
        
        res.json({
            success: true,
            message: 'Xóa học sinh khỏi lịch trình thành công'
        });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa học sinh',
            error: error.message
        });
    }
});