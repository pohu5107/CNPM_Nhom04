-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 31, 2025 lúc 01:46 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `school_bus_db`
--

DELIMITER $$
--
-- Các hàm
--
CREATE DEFINER=`` FUNCTION `get_route_end_point` (`route_id` INT) RETURNS VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE end_point VARCHAR(255);
    
    SELECT s.name INTO end_point
    FROM route_stops rs
    JOIN stops s ON rs.stop_id = s.id
    WHERE rs.route_id = route_id AND rs.stop_order = 99
    LIMIT 1;
    
    RETURN COALESCE(end_point, 'Diem ket thuc');
END$$

CREATE DEFINER=`` FUNCTION `get_route_start_point` (`route_id` INT) RETURNS VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE start_point VARCHAR(255);
    
    SELECT s.name INTO start_point
    FROM route_stops rs
    JOIN stops s ON rs.stop_id = s.id
    WHERE rs.route_id = route_id AND rs.stop_order = 0
    LIMIT 1;
    
    RETURN COALESCE(start_point, 'Diem bat dau');
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `bus_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `pickup_time` time DEFAULT NULL,
  `dropoff_time` time DEFAULT NULL,
  `status` enum('present','absent','late') DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `bus_id`, `date`, `pickup_time`, `dropoff_time`, `status`, `notes`, `created_at`) VALUES
(1, 1, 1, '2025-10-20', '06:31:00', '16:32:00', 'present', NULL, '2025-10-20 13:44:19'),
(2, 2, 2, '2025-10-20', '06:46:00', '16:47:00', 'present', NULL, '2025-10-20 13:44:19'),
(3, 3, 1, '2025-10-20', NULL, NULL, 'absent', NULL, '2025-10-20 13:44:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `buses`
--

CREATE TABLE `buses` (
  `id` int(11) NOT NULL,
  `bus_number` varchar(20) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `capacity` int(11) DEFAULT 25 COMMENT 'Sức chứa tối đa của xe',
  `status` enum('active','maintenance','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `buses`
--

INSERT INTO `buses` (`id`, `bus_number`, `license_plate`, `capacity`, `status`, `created_at`) VALUES
(1, 'BUS-04', '51K-123.45', 20, 'active', '2025-10-20 13:44:19'),
(2, 'BUS-02', '51K-678.90', 20, 'active', '2025-10-20 13:44:19'),
(3, 'BUS-03', '51K-111.22', 15, 'active', '2025-10-20 13:44:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bus_locations`
--

CREATE TABLE `bus_locations` (
  `id` bigint(20) NOT NULL,
  `schedule_id` int(11) NOT NULL COMMENT 'Chuyến đi (lịch trình) mà vị trí này thuộc về',
  `bus_id` int(11) NOT NULL COMMENT 'Xe buýt đang gửi vị trí',
  `driver_id` int(11) NOT NULL COMMENT 'Tài xế đang lái chuyến này',
  `latitude` decimal(10,8) NOT NULL COMMENT 'Kinh độ',
  `longitude` decimal(11,8) NOT NULL COMMENT 'Vĩ độ',
  `speed` decimal(5,2) DEFAULT 0.00 COMMENT 'Tốc độ (km/h)',
  `timestamp` datetime NOT NULL COMMENT 'Thời điểm chính xác của tọa độ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ tọa độ GPS real-time của xe buýt';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `class_name` varchar(20) NOT NULL,
  `grade` varchar(20) NOT NULL,
  `academic_year` varchar(20) DEFAULT '2024-2025',
  `homeroom_teacher` varchar(100) DEFAULT NULL,
  `max_students` int(11) DEFAULT 40,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `classes`
--

INSERT INTO `classes` (`id`, `class_name`, `grade`, `academic_year`, `homeroom_teacher`, `max_students`, `status`, `created_at`) VALUES
(1, '6A1', '6', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(2, '6A2', '6', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(3, '6A3', '6', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(4, '6B1', '6', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(5, '6B2', '6', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(6, '7A1', '7', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(7, '7A2', '7', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(8, '7B1', '7', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(9, '7B2', '7', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(10, '8A1', '8', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(11, '8A2', '8', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(12, '9A1', '9', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59'),
(13, '9A2', '9', '2024-2025', NULL, 40, 'active', '2025-10-21 15:55:59');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `drivers`
--

INSERT INTO `drivers` (`id`, `user_id`, `name`, `phone`, `license_number`, `address`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Nguyễn Văn A', '0901234567', 'A1-12345', NULL, 'active', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(2, 3, 'Trần Thị B', '0912345678', 'A1-54321', '273 an dương vương', 'active', '2025-10-20 13:44:19', '2025-10-23 03:03:13'),
(3, 7, 'Lê Văn C', '0923456789', 'A1-98765', '273 an dương vương ', 'active', '2025-10-20 13:44:19', '2025-10-23 02:40:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `sender_user_id` int(11) DEFAULT NULL COMMENT 'ID người gửi (từ users.id). NULL = Hệ thống tự gửi',
  `recipient_user_id` int(11) NOT NULL COMMENT 'ID người nhận (từ users.id)',
  `schedule_id` int(11) DEFAULT NULL COMMENT 'Liên kết tới lịch trình (nếu có)',
  `title` varchar(255) NOT NULL,
  `message_content` text NOT NULL,
  `type` enum('delay','approaching','incident','general','system') NOT NULL DEFAULT 'general',
  `status` enum('sent','read') NOT NULL DEFAULT 'sent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ tin nhắn và cảnh báo';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `parents`
--

CREATE TABLE `parents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `parents`
--

INSERT INTO `parents` (`id`, `user_id`, `name`, `phone`, `address`, `relationship`) VALUES
(1, 4, 'Trần Văn Dũng', '0987654321', '123 Nguyễn Văn Linh, Q.7, TP.HCM', 'Ba'),
(2, 5, 'Lê Thị Ngọc', '0977654321', '456 Lý Lãm, Q.1, TP.HCM', 'Mẹ'),
(3, 6, 'Phạm Văn An', '0967654321', '789 Võ Văn Kiệt, Q.5, TP.HCM', 'Ba');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `routes`
--

CREATE TABLE `routes` (
  `id` int(11) NOT NULL,
  `route_name` varchar(100) NOT NULL,
  `distance` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `routes`
--

INSERT INTO `routes` (`id`, `route_name`, `distance`, `status`, `created_at`) VALUES
(1, 'Tuyến Quận 1 - Sáng', 15.50, 'active', '2025-10-20 13:44:19'),
(2, 'Tuyến Gò Vấp - Sáng', 22.00, 'active', '2025-10-20 13:44:19'),
(3, 'Tuyến Thủ Đức - Chiều', 18.20, 'active', '2025-10-20 13:44:19'),
(4, 'Tuyến Gò Vấp - Chiều', 22.00, 'active', '2025-10-24 11:28:48'),
(5, 'Tuyến Quận 1 - Chiều', 15.50, 'active', '2025-10-24 12:19:25'),
(6, 'Tuyến Thủ Đức - Sáng', 18.20, 'active', '2025-10-24 12:19:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `route_stops`
--

CREATE TABLE `route_stops` (
  `id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `stop_id` int(11) NOT NULL,
  `stop_order` int(11) NOT NULL,
  `estimated_arrival_time` time DEFAULT NULL,
  `student_pickup_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `route_stops`
--

INSERT INTO `route_stops` (`id`, `route_id`, `stop_id`, `stop_order`, `estimated_arrival_time`, `student_pickup_count`, `created_at`) VALUES
(103, 1, 44, 0, '00:00:00', 0, '2025-10-31 12:08:03'),
(104, 1, 1, 1, '00:15:00', 3, '2025-10-31 12:08:03'),
(105, 1, 46, 2, '00:30:00', 5, '2025-10-31 12:08:03'),
(106, 1, 2, 3, '00:45:00', 4, '2025-10-31 12:08:03'),
(107, 1, 43, 99, '01:00:00', 0, '2025-10-31 12:08:03'),
(108, 2, 49, 0, '00:00:00', 0, '2025-10-31 12:08:03'),
(109, 2, 50, 1, '00:15:00', 4, '2025-10-31 12:08:03'),
(110, 2, 51, 2, '00:30:00', 3, '2025-10-31 12:08:03'),
(111, 2, 52, 3, '00:45:00', 5, '2025-10-31 12:08:03'),
(112, 2, 43, 99, '01:00:00', 0, '2025-10-31 12:08:03'),
(113, 3, 43, 0, '00:00:00', 0, '2025-10-31 12:08:03'),
(114, 3, 57, 1, '00:15:00', 4, '2025-10-31 12:08:03'),
(115, 3, 56, 2, '00:30:00', 7, '2025-10-31 12:08:03'),
(116, 3, 55, 3, '00:45:00', 6, '2025-10-31 12:08:03'),
(117, 3, 54, 99, '01:00:00', 0, '2025-10-31 12:08:03'),
(118, 4, 43, 0, '00:00:00', 0, '2025-10-31 12:08:03'),
(119, 4, 52, 1, '00:15:00', 3, '2025-10-31 12:08:03'),
(120, 4, 51, 2, '00:30:00', 6, '2025-10-31 12:08:03'),
(121, 4, 53, 3, '00:45:00', 4, '2025-10-31 12:08:03'),
(122, 4, 49, 99, '01:00:00', 0, '2025-10-31 12:08:03'),
(123, 5, 43, 0, '00:00:00', 0, '2025-10-31 12:08:03'),
(124, 5, 2, 1, '00:15:00', 5, '2025-10-31 12:08:03'),
(125, 5, 1, 2, '00:25:00', 8, '2025-10-31 12:08:03'),
(126, 5, 48, 3, '00:40:00', 6, '2025-10-31 12:08:03'),
(127, 5, 44, 99, '00:50:00', 0, '2025-10-31 12:08:03'),
(128, 6, 54, 0, '00:00:00', 0, '2025-10-31 12:08:03'),
(129, 6, 55, 1, '00:15:00', 4, '2025-10-31 12:08:03'),
(130, 6, 56, 2, '00:30:00', 7, '2025-10-31 12:08:03'),
(131, 6, 57, 3, '00:45:00', 5, '2025-10-31 12:08:03'),
(132, 6, 43, 99, '01:00:00', 0, '2025-10-31 12:08:03');

--
-- Bẫy `route_stops`
--
DELIMITER $$
CREATE TRIGGER `update_schedule_times_after_insert` AFTER INSERT ON `route_stops` FOR EACH ROW BEGIN
    DECLARE start_time TIME;
    DECLARE end_time TIME;
    
    
    SELECT TIME(ADDTIME(s.scheduled_start_time, '00:00:00')) INTO start_time
    FROM schedules s
    WHERE s.route_id = NEW.route_id
    LIMIT 1;
    
    
    SELECT TIME(ADDTIME(start_time, rs.estimated_arrival_time)) INTO end_time
    FROM route_stops rs
    WHERE rs.route_id = NEW.route_id AND rs.stop_order = 99
    LIMIT 1;
    
    
    UPDATE schedules 
    SET scheduled_end_time = end_time
    WHERE route_id = NEW.route_id AND scheduled_start_time = start_time;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `bus_id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `shift_type` enum('morning','afternoon','evening') NOT NULL,
  `shift_number` int(11) NOT NULL,
  `scheduled_start_time` time NOT NULL COMMENT 'Thời gian dự kiến bắt đầu chuyến (theo lịch)',
  `scheduled_end_time` time NOT NULL COMMENT 'Thời gian dự kiến kết thúc chuyến (theo lịch)',
  `student_count` int(11) DEFAULT 0,
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `actual_start_time` datetime DEFAULT NULL COMMENT 'Thời gian thực tế tài xế bấm nút bắt đầu chuyến',
  `actual_end_time` datetime DEFAULT NULL COMMENT 'Thời gian thực tế tài xế bấm nút kết thúc chuyến',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `schedules`
--

INSERT INTO `schedules` (`id`, `driver_id`, `bus_id`, `route_id`, `date`, `shift_type`, `shift_number`, `scheduled_start_time`, `scheduled_end_time`, `student_count`, `status`, `actual_start_time`, `actual_end_time`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-10-23', 'morning', 1, '06:30:00', '07:30:00', 2, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(2, 1, 1, 2, '2025-10-23', 'morning', 2, '10:00:00', '11:00:00', 1, 'in_progress', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(3, 1, 2, 3, '2025-10-23', 'afternoon', 3, '17:00:00', '18:00:00', 0, 'completed', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(4, 2, 2, 1, '2025-10-23', 'morning', 1, '07:00:00', '08:00:00', 0, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(5, 2, 2, 4, '2025-10-23', 'afternoon', 2, '16:30:00', '17:30:00', 0, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(6, 3, 3, 6, '2025-10-23', 'morning', 1, '06:45:00', '07:45:00', 0, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(7, 1, 1, 1, '2025-10-24', 'morning', 1, '06:30:00', '07:30:00', 2, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(8, 1, 1, 4, '2025-10-24', 'afternoon', 2, '17:00:00', '18:00:00', 0, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(9, 2, 2, 1, '2025-10-24', 'morning', 1, '07:00:00', '08:00:00', 0, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09'),
(10, 3, 3, 3, '2025-10-24', 'afternoon', 1, '17:00:00', '18:00:00', 0, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-10-30 05:23:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stops`
--

CREATE TABLE `stops` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `stops`
--

INSERT INTO `stops` (`id`, `name`, `address`, `latitude`, `longitude`, `status`) VALUES
(1, 'Nhà Văn hóa Thanh Niên', '4 Phạm Ngọc Thạch, P. Bến Nghé, Q.1', 10.78310000, 106.69970000, 'active'),
(2, 'Ngã tư Hàng Xanh', 'Giao lộ Xô Viết Nghệ Tĩnh & Điện Biên Phủ, P.21, Q. Bình Thạnh', 10.79610000, 106.70370000, 'active'),
(3, 'Gigamall Thủ Đức', '240 Phạm Văn Đồng, P. Hiệp Bình Chánh, Thủ Đức', 10.83290000, 106.72030000, 'active'),
(43, 'Truong THCS Nguyen Du', '123 Duong Giao Duc, Q.1, TP.HCM', 10.77690000, 106.70090000, 'active'),
(44, 'Cong vien 23/9', '2 Pham Ngoc Thach, Q.1, TP.HCM', 10.78300000, 106.69970000, 'active'),
(45, 'Nha Van Hoa Thanh Nien', '4 Pham Ngoc Thach, P. Ben Nghe, Q.1', 10.78310000, 106.69970000, 'active'),
(46, 'Nga Sau Phu Dong', '240 Pham Van Dong, P. Hiep Binh Chanh, Thu Duc', 10.83290000, 106.72030000, 'active'),
(47, 'Nga Tu Hang Xanh', 'Giao lo Xo Viet Nghe Tinh & Dien Bien Phu, P.21, Q.Binh Thanh', 10.79610000, 106.70370000, 'active'),
(48, 'Ben Thanh', '1 Le Loi, P. Ben Nghe, Q.1, TP.HCM', 10.77260000, 106.69800000, 'active'),
(49, 'Cong vien Lang Hoa', '1040 Quang Trung, P.8, Go Vap, TP.HCM', 10.83710000, 106.67950000, 'active'),
(50, 'Nga Tu Phan Van Tri - Le Duc Tho', '197 Le Duc Tho, P.6, Go Vap, TP.HCM', 10.84200000, 106.68500000, 'active'),
(51, 'Nga Nam Chuong Cho', '789 Quang Trung, Go Vap, TP.HCM', 10.83950000, 106.68260000, 'active'),
(52, 'Cau vuot Nguyen Thai Son', '268 Ly Thuong Kiet, P. Hiep Phu, Thu Duc, TP.HCM', 10.84500000, 106.75800000, 'active'),
(53, 'Lotte Mart Nguyen Van Luong', '30 Vo Van Ngan, P. Linh Chieu, Thu Duc, TP.HCM', 10.85000000, 106.76000000, 'active'),
(54, 'Chung cu Sunview Town', '321 Vo Van Ngan, Thu Duc, TP.HCM', 10.85160000, 106.77180000, 'active'),
(55, 'Vincom Thu Duc', '216 Vo Van Ngan, Thu Duc, TP.HCM', 10.85000000, 106.77000000, 'active'),
(56, 'Xa Lo Ha Noi - Nga 4 Binh Thai', '1040 Xa Lo Ha Noi, Thu Duc, TP.HCM', 10.86000000, 106.78000000, 'active'),
(57, 'Cau Sai Gon', 'Cau Sai Gon, TP.HCM', 10.82000000, 106.74000000, 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `grade` varchar(20) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `class` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `route_id` int(11) DEFAULT NULL,
  `morning_pickup_stop_id` int(11) DEFAULT NULL COMMENT 'ID của điểm dừng đón học sinh (tham chiếu stops.id)',
  `afternoon_dropoff_stop_id` int(11) DEFAULT NULL COMMENT 'ID của điểm dừng trả học sinh (tham chiếu stops.id)',
  `pickup_time` time DEFAULT NULL,
  `dropoff_time` time DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `students`
--

INSERT INTO `students` (`id`, `name`, `grade`, `class_id`, `class`, `address`, `phone`, `parent_id`, `route_id`, `morning_pickup_stop_id`, `afternoon_dropoff_stop_id`, `pickup_time`, `dropoff_time`, `status`) VALUES
(1, 'Trần Dũng Minh', '6', 1, '6A1', '123 Nguyễn Văn Linh, Q.7, TP.HCM', '0123456789', 1, 1, NULL, NULL, '06:30:00', '16:30:00', 'active'),
(2, 'Lê Ngọc Anh', '7', 9, '7B2', '456 Lý Lãm, Q.1, TP.HCM', '0123456790', 2, 2, NULL, NULL, '06:45:00', '16:45:00', 'active'),
(3, 'Phạm An Khang', '6', 1, '6A1', '789 Võ Văn Kiệt, Q.5, TP.HCM', '0123456791', 3, 1, NULL, NULL, '06:40:00', '16:30:00', 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','driver','parent') DEFAULT 'parent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@school.com', '$2b$10$hashed_password_admin', 'admin', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(2, 'driver1', 'driver1@school.com', '$2b$10$hashed_password_driver1', 'driver', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(3, 'driver2', 'driver2@school.com', '$2b$10$hashed_password_driver2', 'driver', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(4, 'parent1', 'parent1@gmail.com', '$2b$10$hashed_password_parent1', 'parent', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(5, 'parent2', 'parent2@gmail.com', '$2b$10$hashed_password_parent2', 'parent', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(6, 'parent3', 'parent3@gmail.com', '$2b$10$hashed_password_parent3', 'parent', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(7, 'driver3', 'driver3@school.com', '$2b$10$hashed_password_driver3', 'driver', '2025-10-20 13:44:19', '2025-10-20 13:44:19');

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `view_class_statistics`
-- (See below for the actual view)
--
CREATE TABLE `view_class_statistics` (
`class_id` int(11)
,`class_name` varchar(20)
,`grade` varchar(20)
,`academic_year` varchar(20)
,`homeroom_teacher` varchar(100)
,`max_students` int(11)
,`current_students` bigint(21)
,`available_slots` bigint(22)
,`status` enum('active','inactive')
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `view_parent_children_count`
-- (See below for the actual view)
--
CREATE TABLE `view_parent_children_count` (
`parent_id` int(11)
,`parent_name` varchar(100)
,`phone` varchar(20)
,`address` text
,`relationship` varchar(50)
,`children_count` bigint(21)
,`children_names` mediumtext
,`children_classes` mediumtext
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `view_students_with_parents`
-- (See below for the actual view)
--
CREATE TABLE `view_students_with_parents` (
`id` int(11)
,`student_name` varchar(100)
,`grade` varchar(20)
,`class` varchar(20)
,`class_name` varchar(20)
,`homeroom_teacher` varchar(100)
,`address` text
,`student_phone` varchar(20)
,`status` enum('active','inactive')
,`pickup_time` time
,`dropoff_time` time
,`parent_id` int(11)
,`parent_name` varchar(100)
,`parent_phone` varchar(20)
,`parent_address` text
,`relationship` varchar(50)
,`route_id` int(11)
,`route_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `view_student_current_bus`
-- (See below for the actual view)
--
CREATE TABLE `view_student_current_bus` (
`student_id` int(11)
,`student_name` varchar(100)
,`route_id` int(11)
,`route_name` varchar(100)
,`bus_id` int(11)
,`bus_number` varchar(20)
,`date` date
,`start_time` time
,`end_time` time
);

-- --------------------------------------------------------

--
-- Cấu trúc cho view `view_class_statistics`
--
DROP TABLE IF EXISTS `view_class_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `view_class_statistics`  AS SELECT `c`.`id` AS `class_id`, `c`.`class_name` AS `class_name`, `c`.`grade` AS `grade`, `c`.`academic_year` AS `academic_year`, `c`.`homeroom_teacher` AS `homeroom_teacher`, `c`.`max_students` AS `max_students`, count(`s`.`id`) AS `current_students`, `c`.`max_students`- count(`s`.`id`) AS `available_slots`, `c`.`status` AS `status` FROM (`classes` `c` left join `students` `s` on(`c`.`id` = `s`.`class_id` and `s`.`status` = 'active')) GROUP BY `c`.`id`, `c`.`class_name`, `c`.`grade`, `c`.`academic_year`, `c`.`homeroom_teacher`, `c`.`max_students`, `c`.`status` ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `view_parent_children_count`
--
DROP TABLE IF EXISTS `view_parent_children_count`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `view_parent_children_count`  AS SELECT `p`.`id` AS `parent_id`, `p`.`name` AS `parent_name`, `p`.`phone` AS `phone`, `p`.`address` AS `address`, `p`.`relationship` AS `relationship`, count(`s`.`id`) AS `children_count`, group_concat(`s`.`name` order by `s`.`name` ASC separator ', ') AS `children_names`, group_concat(`s`.`class` order by `s`.`name` ASC separator ', ') AS `children_classes` FROM (`parents` `p` left join `students` `s` on(`p`.`id` = `s`.`parent_id` and `s`.`status` = 'active')) GROUP BY `p`.`id`, `p`.`name`, `p`.`phone`, `p`.`address`, `p`.`relationship` ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `view_students_with_parents`
--
DROP TABLE IF EXISTS `view_students_with_parents`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `view_students_with_parents`  AS SELECT `s`.`id` AS `id`, `s`.`name` AS `student_name`, `s`.`grade` AS `grade`, `s`.`class` AS `class`, `c`.`class_name` AS `class_name`, `c`.`homeroom_teacher` AS `homeroom_teacher`, `s`.`address` AS `address`, `s`.`phone` AS `student_phone`, `s`.`status` AS `status`, `s`.`pickup_time` AS `pickup_time`, `s`.`dropoff_time` AS `dropoff_time`, `p`.`id` AS `parent_id`, `p`.`name` AS `parent_name`, `p`.`phone` AS `parent_phone`, `p`.`address` AS `parent_address`, `p`.`relationship` AS `relationship`, `r`.`id` AS `route_id`, `r`.`route_name` AS `route_name` FROM (((`students` `s` left join `classes` `c` on(`s`.`class_id` = `c`.`id`)) left join `parents` `p` on(`s`.`parent_id` = `p`.`id`)) left join `routes` `r` on(`s`.`route_id` = `r`.`id`)) ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `view_student_current_bus`
--
DROP TABLE IF EXISTS `view_student_current_bus`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `view_student_current_bus`  AS SELECT `s`.`id` AS `student_id`, `s`.`name` AS `student_name`, `s`.`route_id` AS `route_id`, `r`.`route_name` AS `route_name`, `sch`.`bus_id` AS `bus_id`, `b`.`bus_number` AS `bus_number`, `sch`.`date` AS `date`, `sch`.`scheduled_start_time` AS `start_time`, `sch`.`scheduled_end_time` AS `end_time` FROM (((`students` `s` left join `routes` `r` on(`s`.`route_id` = `r`.`id`)) left join `schedules` `sch` on(`s`.`route_id` = `sch`.`route_id` and `sch`.`date` = curdate())) left join `buses` `b` on(`sch`.`bus_id` = `b`.`id`)) WHERE `s`.`status` = 'active' ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_date` (`student_id`,`date`),
  ADD KEY `bus_id` (`bus_id`);

--
-- Chỉ mục cho bảng `buses`
--
ALTER TABLE `buses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bus_number` (`bus_number`),
  ADD UNIQUE KEY `license_plate` (`license_plate`);

--
-- Chỉ mục cho bảng `bus_locations`
--
ALTER TABLE `bus_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_schedule_id` (`schedule_id`),
  ADD KEY `idx_bus_id` (`bus_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `fk_location_driver` (`driver_id`);

--
-- Chỉ mục cho bảng `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_year` (`class_name`,`academic_year`);

--
-- Chỉ mục cho bảng `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient_user_id` (`recipient_user_id`),
  ADD KEY `idx_schedule_id` (`schedule_id`),
  ADD KEY `fk_notification_sender` (`sender_user_id`);

--
-- Chỉ mục cho bảng `parents`
--
ALTER TABLE `parents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `route_stops`
--
ALTER TABLE `route_stops`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_route_stop_order` (`route_id`,`stop_order`),
  ADD KEY `idx_route_id` (`route_id`),
  ADD KEY `idx_stop_id` (`stop_id`);

--
-- Chỉ mục cho bảng `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_driver_date_shift` (`driver_id`,`date`,`shift_number`),
  ADD KEY `bus_id` (`bus_id`),
  ADD KEY `route_id` (`route_id`);

--
-- Chỉ mục cho bảng `stops`
--
ALTER TABLE `stops`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `route_id` (`route_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `idx_class_id` (`class_id`),
  ADD KEY `fk_morning_pickup_stop` (`morning_pickup_stop_id`),
  ADD KEY `fk_afternoon_dropoff_stop` (`afternoon_dropoff_stop_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `buses`
--
ALTER TABLE `buses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `bus_locations`
--
ALTER TABLE `bus_locations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `parents`
--
ALTER TABLE `parents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `routes`
--
ALTER TABLE `routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `route_stops`
--
ALTER TABLE `route_stops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=133;

--
-- AUTO_INCREMENT cho bảng `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `stops`
--
ALTER TABLE `stops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT cho bảng `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `bus_locations`
--
ALTER TABLE `bus_locations`
  ADD CONSTRAINT `fk_location_bus` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_location_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_location_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_recipient` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notification_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notification_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `parents`
--
ALTER TABLE `parents`
  ADD CONSTRAINT `parents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `route_stops`
--
ALTER TABLE `route_stops`
  ADD CONSTRAINT `route_stops_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `route_stops_ibfk_2` FOREIGN KEY (`stop_id`) REFERENCES `stops` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_afternoon_dropoff_stop` FOREIGN KEY (`afternoon_dropoff_stop_id`) REFERENCES `stops` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_morning_pickup_stop` FOREIGN KEY (`morning_pickup_stop_id`) REFERENCES `stops` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_ibfk_4` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
