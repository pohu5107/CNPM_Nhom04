-- Migration script: Chuyển từ students.route_id sang student_route_assignments
-- Chạy script này để migrate dữ liệu hiện tại

-- 1. Tạo bảng student_route_assignments nếu chưa có
CREATE TABLE IF NOT EXISTS student_route_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  route_id INT NOT NULL,
  pickup_stop_id INT NULL COMMENT 'Điểm đón cụ thể',
  dropoff_stop_id INT NULL COMMENT 'Điểm trả cụ thể',
  effective_start_date DATE NOT NULL COMMENT 'Ngày bắt đầu hiệu lực',
  effective_end_date DATE NULL COMMENT 'Ngày kết thúc (NULL = vô thời hạn)',
  shift_type ENUM('morning','afternoon','evening') NOT NULL COMMENT 'Ca học',
  active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Còn hiệu lực',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes để query nhanh
  INDEX idx_student_date (student_id, effective_start_date, effective_end_date),
  INDEX idx_route_date (route_id, effective_start_date, effective_end_date),
  INDEX idx_shift_date (shift_type, effective_start_date, effective_end_date),
  INDEX idx_active (active),
  
  -- Foreign keys
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (pickup_stop_id) REFERENCES stops(id) ON DELETE SET NULL,
  FOREIGN KEY (dropoff_stop_id) REFERENCES stops(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Phân công học sinh theo tuyến, điểm dừng, thời gian và ca học';

-- 2. Migrate dữ liệu từ students.route_id sang student_route_assignments
-- Chỉ migrate những học sinh đã có route_id
INSERT INTO student_route_assignments (
  student_id, 
  route_id, 
  pickup_stop_id, 
  dropoff_stop_id,
  effective_start_date,
  effective_end_date,
  shift_type,
  active
)
SELECT 
  s.id as student_id,
  s.route_id,
  s.morning_pickup_stop_id,    -- Nếu có sẵn
  s.afternoon_dropoff_stop_id, -- Nếu có sẵn
  CURDATE() as effective_start_date,  -- Bắt đầu từ hôm nay
  NULL as effective_end_date,         -- Vô thời hạn
  'morning' as shift_type,           -- Mặc định ca sáng
  1 as active
FROM students s 
WHERE s.route_id IS NOT NULL 
  AND s.status = 'active'
  AND NOT EXISTS (
    -- Tránh duplicate nếu đã có data
    SELECT 1 FROM student_route_assignments sra 
    WHERE sra.student_id = s.id 
      AND sra.route_id = s.route_id
      AND sra.shift_type = 'morning'
      AND sra.active = 1
  );

-- 3. Thêm phân công ca chiều cho các học sinh đã có tuyến
INSERT INTO student_route_assignments (
  student_id, 
  route_id, 
  pickup_stop_id, 
  dropoff_stop_id,
  effective_start_date,
  effective_end_date,
  shift_type,
  active
)
SELECT 
  s.id as student_id,
  s.route_id,
  s.afternoon_dropoff_stop_id, -- Đảo ngược: trả chiều = đón sáng
  s.morning_pickup_stop_id,    -- Đảo ngược: đón chiều = trả sáng  
  CURDATE() as effective_start_date,
  NULL as effective_end_date,
  'afternoon' as shift_type,
  1 as active
FROM students s 
WHERE s.route_id IS NOT NULL 
  AND s.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM student_route_assignments sra 
    WHERE sra.student_id = s.id 
      AND sra.route_id = s.route_id
      AND sra.shift_type = 'afternoon'
      AND sra.active = 1
  );

-- 4. Tạo view để backward compatibility
CREATE OR REPLACE VIEW view_students_current_route AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  s.class,
  s.grade,
  -- Lấy route_id từ assignment gần nhất và đang active
  sra.route_id,
  r.route_name,
  sra.shift_type,
  sra.pickup_stop_id,
  sra.dropoff_stop_id,
  ps.name as pickup_stop_name,
  ds.name as dropoff_stop_name,
  sra.effective_start_date,
  sra.effective_end_date
FROM students s
LEFT JOIN student_route_assignments sra ON s.id = sra.student_id 
  AND sra.active = 1
  AND (sra.effective_start_date <= CURDATE())
  AND (sra.effective_end_date IS NULL OR sra.effective_end_date >= CURDATE())
LEFT JOIN routes r ON sra.route_id = r.id
LEFT JOIN stops ps ON sra.pickup_stop_id = ps.id  
LEFT JOIN stops ds ON sra.dropoff_stop_id = ds.id
WHERE s.status = 'active';

-- 5. Tạo function helper để check assignment
DELIMITER $$
CREATE FUNCTION is_student_assigned_on_date(
  p_student_id INT, 
  p_date DATE, 
  p_shift_type VARCHAR(20)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE assignment_count INT DEFAULT 0;
  
  SELECT COUNT(*) INTO assignment_count
  FROM student_route_assignments sra
  WHERE sra.student_id = p_student_id
    AND sra.shift_type = p_shift_type
    AND sra.active = 1
    AND sra.effective_start_date <= p_date
    AND (sra.effective_end_date IS NULL OR sra.effective_end_date >= p_date);
  
  RETURN assignment_count > 0;
END$$
DELIMITER ;

-- 6. Optional: Backup và clear students.route_id sau khi migrate
-- UNCOMMENT sau khi đã test và confirm migration thành công
/*
ALTER TABLE students ADD COLUMN route_id_backup INT COMMENT 'Backup của route_id cũ';
UPDATE students SET route_id_backup = route_id WHERE route_id IS NOT NULL;
UPDATE students SET route_id = NULL; -- Clear route_id để tránh confusion
*/

SELECT 'Migration completed! Kiểm tra dữ liệu:' as message;

-- Kiểm tra kết quả migration
SELECT 
  'Total students with old route_id' as type,
  COUNT(*) as count 
FROM students 
WHERE route_id IS NOT NULL AND status = 'active'

UNION ALL

SELECT 
  'Total new assignments created' as type,
  COUNT(*) as count
FROM student_route_assignments 
WHERE active = 1

UNION ALL

SELECT 
  CONCAT('Assignments for shift: ', shift_type) as type,
  COUNT(*) as count
FROM student_route_assignments 
WHERE active = 1
GROUP BY shift_type;