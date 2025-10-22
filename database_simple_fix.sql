
-- Tắt foreign key checks để có thể xóa/sửa bảng
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Bước 1: Tạo bảng CLASSES (Lớp học)
-- ============================================
DROP TABLE IF EXISTS `classes`;

CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_name` varchar(20) NOT NULL,
  `grade` varchar(20) NOT NULL,
  `academic_year` varchar(20) DEFAULT '2024-2025',
  `homeroom_teacher` varchar(100) DEFAULT NULL,
  `max_students` int(11) DEFAULT 40,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_year` (`class_name`, `academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu cho bảng classes
INSERT INTO `classes` (`class_name`, `grade`, `academic_year`, `max_students`, `status`) VALUES
('6A1', '6', '2024-2025', 40, 'active'),
('6A2', '6', '2024-2025', 40, 'active'),
('6A3', '6', '2024-2025', 40, 'active'),
('6B1', '6', '2024-2025', 40, 'active'),
('6B2', '6', '2024-2025', 40, 'active'),
('7A1', '7', '2024-2025', 40, 'active'),
('7A2', '7', '2024-2025', 40, 'active'),
('7B1', '7', '2024-2025', 40, 'active'),
('7B2', '7', '2024-2025', 40, 'active'),
('8A1', '8', '2024-2025', 40, 'active'),
('8A2', '8', '2024-2025', 40, 'active'),
('9A1', '9', '2024-2025', 40, 'active'),
('9A2', '9', '2024-2025', 40, 'active');

-- ============================================
-- Bước 2: SỬA QUAN HỆ STUDENTS - PARENTS
-- ============================================

-- 2.1: Xóa constraint cũ (SAI - trỏ đến users.id)
ALTER TABLE `students` 
DROP FOREIGN KEY IF EXISTS `students_ibfk_1`;

-- 2.2: Cập nhật dữ liệu students.parent_id
-- Chuyển từ users.id (4,5,6) sang parents.id (1,2,3)
UPDATE `students` SET `parent_id` = 1 WHERE `id` = 1 AND `parent_id` = 4;
UPDATE `students` SET `parent_id` = 2 WHERE `id` = 2 AND `parent_id` = 5;
UPDATE `students` SET `parent_id` = 3 WHERE `id` = 3 AND `parent_id` = 6;

-- 2.3: Thêm constraint ĐÚNG (trỏ đến parents.id)
ALTER TABLE `students` 
ADD CONSTRAINT `students_ibfk_1` 
FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- Bước 3: Thêm class_id vào students (tùy chọn)
-- ============================================
-- Nếu muốn link học sinh với bảng classes
ALTER TABLE `students` 
ADD COLUMN IF NOT EXISTS `class_id` int(11) DEFAULT NULL AFTER `class`,
ADD KEY IF NOT EXISTS `idx_class_id` (`class_id`);

-- Xóa constraint cũ nếu tồn tại
ALTER TABLE `students` DROP FOREIGN KEY IF EXISTS `students_ibfk_4`;

-- Thêm foreign key constraint mới
ALTER TABLE `students` 
ADD CONSTRAINT `students_ibfk_4` 
FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Cập nhật class_id cho students hiện tại dựa trên class name
UPDATE `students` s
JOIN `classes` c ON s.class = c.class_name
SET s.class_id = c.id
WHERE s.class_id IS NULL;

-- ============================================
-- Bước 4: Tạo VIEWs để query dễ dàng
-- ============================================

-- View: Danh sách học sinh với thông tin phụ huynh
DROP VIEW IF EXISTS `view_students_with_parents`;
CREATE VIEW `view_students_with_parents` AS
SELECT 
  s.id,
  s.name AS student_name,
  s.grade,
  s.class,
  c.class_name,
  c.homeroom_teacher,
  s.address,
  s.phone AS student_phone,
  s.status,
  s.pickup_time,
  s.dropoff_time,
  p.id AS parent_id,
  p.name AS parent_name,
  p.phone AS parent_phone,
  p.address AS parent_address,
  p.relationship,
  r.id AS route_id,
  r.route_name,
  b.id AS bus_id,
  b.bus_number,
  b.license_plate
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN parents p ON s.parent_id = p.id
LEFT JOIN routes r ON s.route_id = r.id
LEFT JOIN buses b ON s.bus_id = b.id;

-- View: Thống kê số học sinh theo lớp
DROP VIEW IF EXISTS `view_class_statistics`;
CREATE VIEW `view_class_statistics` AS
SELECT 
  c.id AS class_id,
  c.class_name,
  c.grade,
  c.academic_year,
  c.homeroom_teacher,
  c.max_students,
  COUNT(s.id) AS current_students,
  (c.max_students - COUNT(s.id)) AS available_slots,
  c.status
FROM classes c
LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
GROUP BY c.id, c.class_name, c.grade, c.academic_year, c.homeroom_teacher, c.max_students, c.status;

-- View: Thống kê số con của mỗi phụ huynh
DROP VIEW IF EXISTS `view_parent_children_count`;
CREATE VIEW `view_parent_children_count` AS
SELECT 
  p.id AS parent_id,
  p.name AS parent_name,
  p.phone,
  p.address,
  p.relationship,
  COUNT(s.id) AS children_count,
  GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ', ') AS children_names,
  GROUP_CONCAT(s.class ORDER BY s.name SEPARATOR ', ') AS children_classes
FROM parents p
LEFT JOIN students s ON p.id = s.parent_id AND s.status = 'active'
GROUP BY p.id, p.name, p.phone, p.address, p.relationship;

-- ============================================
-- Bước 5: Cập nhật dữ liệu mẫu
-- ============================================

-- Thêm địa chỉ cho parents (đang NULL)
UPDATE `parents` SET `address` = '123 Nguyễn Văn Linh, Q.7, TP.HCM' WHERE `id` = 1 AND `address` IS NULL;
UPDATE `parents` SET `address` = '456 Lê Lai, Q.1, TP.HCM' WHERE `id` = 2 AND `address` IS NULL;
UPDATE `parents` SET `address` = '789 Võ Văn Kiệt, Q.5, TP.HCM' WHERE `id` = 3 AND `address` IS NULL;

-- Thêm địa chỉ cho students (đang NULL)
UPDATE `students` SET `address` = '123 Nguyễn Văn Linh, Q.7, TP.HCM' WHERE `id` = 1 AND `address` IS NULL;
UPDATE `students` SET `address` = '456 Lê Lai, Q.1, TP.HCM' WHERE `id` = 2 AND `address` IS NULL;
UPDATE `students` SET `address` = '789 Võ Văn Kiệt, Q.5, TP.HCM' WHERE `id` = 3 AND `address` IS NULL;

-- Thêm số điện thoại cho students
UPDATE `students` SET `phone` = '0123456789' WHERE `id` = 1 AND `phone` IS NULL;
UPDATE `students` SET `phone` = '0123456790' WHERE `id` = 2 AND `phone` IS NULL;
UPDATE `students` SET `phone` = '0123456791' WHERE `id` = 3 AND `phone` IS NULL;



-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

