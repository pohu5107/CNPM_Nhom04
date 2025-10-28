-- Thêm bảng liên kết schedules với students cụ thể
CREATE TABLE `schedule_students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `pickup_stop_id` int(11) DEFAULT NULL,
  `dropoff_stop_id` int(11) DEFAULT NULL,
  `pickup_time` time DEFAULT NULL,
  `dropoff_time` time DEFAULT NULL,
  `status` enum('not_picked','picked_up','dropped_off','absent') DEFAULT 'not_picked',
  `notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_schedule_student` (`schedule_id`, `student_id`),
  FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pickup_stop_id`) REFERENCES `stops` (`id`),
  FOREIGN KEY (`dropoff_stop_id`) REFERENCES `stops` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu liên kết schedules với students
INSERT INTO `schedule_students` (`schedule_id`, `student_id`, `pickup_stop_id`, `dropoff_stop_id`, `status`) VALUES
-- Schedule 1 (Driver 1, Ca 1 Sáng)
(1, 1, 1, 2, 'picked_up'),
(1, 2, 1, 2, 'not_picked'),
(1, 3, 3, 2, 'not_picked'),

-- Schedule 2 (Driver 1, Ca 2 Sáng)  
(2, 4, 2, 1, 'not_picked'),
(2, 5, 2, 3, 'not_picked'),

-- Schedule 3 (Driver 1, Ca 3 Chiều)
(3, 1, 2, 1, 'not_picked'),
(3, 2, 2, 1, 'not_picked'),
(3, 3, 2, 3, 'not_picked'),

-- Schedule 4 (Driver 2, Ca 1 Sáng)
(4, 4, 4, 5, 'not_picked'),
(4, 5, 4, 5, 'not_picked'),

-- Schedule 5 (Driver 2, Ca 2 Chiều)
(5, 6, 5, 4, 'not_picked'),

-- Schedule 6 (Driver 3, Ca 1 Sáng)
(6, 7, 6, 7, 'not_picked'),
(6, 8, 6, 7, 'not_picked');

-- Tạo view để lấy thông tin schedules với students
CREATE VIEW view_schedule_with_students AS
SELECT 
    s.id as schedule_id,
    s.date,
    s.shift_type,
    s.shift_number,
    s.start_time,
    s.end_time,
    s.start_point,
    s.end_point,
    s.status as schedule_status,
    
    -- Thông tin driver
    d.id as driver_id,
    d.name as driver_name,
    d.phone as driver_phone,
    
    -- Thông tin bus
    b.id as bus_id,
    b.bus_number,
    b.license_plate,
    
    -- Thông tin route
    r.id as route_id,
    r.route_name,
    r.distance,
    
    -- Thông tin student
    st.id as student_id,
    st.name as student_name,
    st.grade,
    st.class,
    c.class_name,
    
    -- Thông tin pickup/dropoff
    ss.pickup_stop_id,
    ss.dropoff_stop_id,
    ss.pickup_time,
    ss.dropoff_time,
    ss.status as student_status,
    
    -- Thông tin stops
    pickup_stop.stop_name as pickup_stop_name,
    pickup_stop.address as pickup_address,
    dropoff_stop.stop_name as dropoff_stop_name,
    dropoff_stop.address as dropoff_address
    
FROM schedules s
INNER JOIN drivers d ON s.driver_id = d.id
INNER JOIN buses b ON s.bus_id = b.id  
INNER JOIN routes r ON s.route_id = r.id
LEFT JOIN schedule_students ss ON s.id = ss.schedule_id
LEFT JOIN students st ON ss.student_id = st.id
LEFT JOIN classes c ON st.class_id = c.id
LEFT JOIN stops pickup_stop ON ss.pickup_stop_id = pickup_stop.id
LEFT JOIN stops dropoff_stop ON ss.dropoff_stop_id = dropoff_stop.id
ORDER BY s.date, s.start_time, st.name;