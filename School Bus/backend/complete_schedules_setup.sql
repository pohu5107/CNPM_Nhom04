-- =====================================================
-- SCRIPT TỔNG HỢP: TẠO LẠI BẢNG SCHEDULES VÀ ROUTE_STOPS
-- Tác giả: System
-- Ngày tạo: 2025-10-24
-- Mô tả: Tạo lại toàn bộ cấu trúc và dữ liệu cho lịch trình xe buýt
-- =====================================================

-- Xóa dữ liệu cũ (nếu có)
DROP TABLE IF EXISTS route_stops;
DROP TABLE IF EXISTS schedules;

-- =====================================================
-- 1. TẠO BẢNG SCHEDULES
-- =====================================================
CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    bus_id INT NOT NULL,
    route_id INT NOT NULL,
    date DATE NOT NULL,
    shift_type ENUM('morning', 'afternoon', 'evening') NOT NULL,
    shift_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    estimated_duration INT DEFAULT 60, -- phút
    student_count INT DEFAULT 0,
    max_capacity INT DEFAULT 25,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_driver_date_shift (driver_id, date, shift_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TẠO BẢNG ROUTE_STOPS
-- =====================================================
CREATE TABLE route_stops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    stop_id INT NOT NULL,
    stop_order INT NOT NULL,
    estimated_arrival_time TIME,
    student_pickup_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
    UNIQUE KEY unique_route_stop_order (route_id, stop_order),
    INDEX idx_route_id (route_id),
    INDEX idx_stop_id (stop_id)
);

-- =====================================================
-- 3. THÊM DỮ LIỆU MẪU CHO BẢNG SCHEDULES
-- =====================================================

-- Driver 1 - Nguyễn Văn A (ID: 1)
INSERT INTO schedules (driver_id, bus_id, route_id, date, shift_type, shift_number, start_time, end_time, start_point, end_point, student_count, max_capacity, status) VALUES
(1, 1, 1, '2025-10-23', 'morning', 1, '06:30:00', '07:30:00', '120 Nguyễn Trãi', '273 An Dương Vương', 15, 20, 'scheduled'),
(1, 1, 2, '2025-10-23', 'morning', 2, '10:00:00', '11:00:00', '273 An Dương Vương', '120 Nguyễn Trãi', 12, 18, 'in_progress'),
(1, 2, 3, '2025-10-23', 'afternoon', 3, '17:00:00', '18:00:00', '134 Lê Đại Hành', '273 An Dương Vương', 18, 22, 'completed');

-- Driver 2 - Trần Thị B (ID: 2)
INSERT INTO schedules (driver_id, bus_id, route_id, date, shift_type, shift_number, start_time, end_time, start_point, end_point, student_count, max_capacity, status) VALUES
(2, 2, 1, '2025-10-23', 'morning', 1, '07:00:00', '08:00:00', '50 Lê Lợi', '100 Nguyễn Huệ', 14, 20, 'scheduled'),
(2, 2, 2, '2025-10-23', 'afternoon', 2, '16:30:00', '17:30:00', '100 Nguyễn Huệ', '50 Lê Lợi', 16, 20, 'scheduled');

-- Driver 3 - Lê Văn C (ID: 3)  
INSERT INTO schedules (driver_id, bus_id, route_id, date, shift_type, shift_number, start_time, end_time, start_point, end_point, student_count, max_capacity, status) VALUES
(3, 3, 3, '2025-10-23', 'morning', 1, '06:45:00', '07:45:00', '200 Trường Sa', '150 Hoàng Sa', 10, 15, 'scheduled');

-- Thêm dữ liệu cho ngày 24/10/2025 (hôm nay)
INSERT INTO schedules (driver_id, bus_id, route_id, date, shift_type, shift_number, start_time, end_time, start_point, end_point, student_count, max_capacity, status) VALUES
(1, 1, 1, '2025-10-24', 'morning', 1, '06:30:00', '07:30:00', '120 Nguyễn Trãi', '273 An Dương Vương', 18, 20, 'scheduled'),
(1, 1, 2, '2025-10-24', 'afternoon', 2, '17:00:00', '18:00:00', '273 An Dương Vương', '120 Nguyễn Trãi', 15, 18, 'scheduled'),
(2, 2, 1, '2025-10-24', 'morning', 1, '07:00:00', '08:00:00', '50 Lê Lợi', '100 Nguyễn Huệ', 16, 20, 'scheduled'),
(3, 3, 3, '2025-10-24', 'afternoon', 1, '17:00:00', '18:00:00', '200 Trường Sa', '150 Hoàng Sa', 12, 15, 'scheduled');

-- =====================================================
-- 4. THÊM DỮ LIỆU MẪU CHO BẢNG ROUTE_STOPS
-- =====================================================

-- Tuyến 1 (Quận 1 - Sáng): 120 Nguyễn Trãi → 273 An Dương Vương
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_arrival_time, student_pickup_count) VALUES
(1, 1, 1, '06:45:00', 0),  -- Điểm xuất phát (không đón học sinh)
(1, 2, 2, '07:00:00', 5),  -- Trạm trung gian 1
(1, 3, 3, '07:15:00', 8);  -- Điểm đến (trường học)

-- Tuyến 2 (Gò Vấp - Sáng): 273 An Dương Vương → 120 Nguyễn Trãi  
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_arrival_time, student_pickup_count) VALUES
(2, 2, 1, '10:15:00', 0),  -- Điểm xuất phát
(2, 3, 2, '10:30:00', 3),  -- Trạm trung gian 1
(2, 1, 3, '10:45:00', 6);  -- Điểm đến

-- Tuyến 3 (Thủ Đức - Chiều): 134 Lê Đại Hành → 273 An Dương Vương
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_arrival_time, student_pickup_count) VALUES
(3, 3, 1, '17:15:00', 0),  -- Điểm xuất phát
(3, 1, 2, '17:30:00', 4),  -- Trạm trung gian 1
(3, 2, 3, '17:45:00', 7);  -- Điểm đến

-- =====================================================
-- 5. KIỂM TRA DỮ LIỆU
-- =====================================================

-- Kiểm tra số lượng bản ghi đã tạo
SELECT 'SCHEDULES' as table_name, COUNT(*) as total_records FROM schedules
UNION ALL
SELECT 'ROUTE_STOPS' as table_name, COUNT(*) as total_records FROM route_stops;

-- Hiển thị thông tin chi tiết schedules
SELECT 
    s.id,
    s.driver_id,
    s.bus_id, 
    s.route_id,
    s.date,
    s.shift_type,
    s.shift_number,
    s.start_time,
    s.end_time,
    s.start_point,
    s.end_point,
    s.student_count,
    s.status
FROM schedules s
ORDER BY s.date, s.start_time;

-- Hiển thị thông tin chi tiết route_stops
SELECT 
    rs.id,
    rs.route_id,
    rs.stop_id,
    rs.stop_order,
    rs.estimated_arrival_time,
    rs.student_pickup_count
FROM route_stops rs
ORDER BY rs.route_id, rs.stop_order;

-- =====================================================
-- KẾT THÚC SCRIPT
-- =====================================================