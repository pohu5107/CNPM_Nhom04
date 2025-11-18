-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 18, 2025 lúc 12:18 PM
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
(3, 'BUS-03', '51K-111.22', 15, 'active', '2025-10-20 13:44:19'),
(6, 'BUS-05', '51K-123.94', 25, 'active', '2025-11-10 15:15:58'),
(7, 'BUS-06', '51K-123.43', 25, 'active', '2025-11-14 05:48:49');

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
(4, 30, 'Nguyễn Văn Minh', '0901234567', '123 Nguyễn Thái Học, Q.1, TP.HCM', 'Ba'),
(5, 31, 'Trần Thị Lan', '0912345678', '456 Lê Văn Sỹ, Q.3, TP.HCM', 'Mẹ'),
(6, 33, 'Lê Minh Tuấn', '0923456789', '789 Võ Văn Tần, Q.Gò Vấp, TP.HCM', 'Ba'),
(7, 32, 'Phạm Thị Hoa', '0934567890', '321 Phan Văn Trị, Q.Gò Vấp, TP.HCM', 'Mẹ'),
(8, 29, 'Hoàng Văn Nam', '0945678901', '654 Kha Vạn Cân, Q.Thủ Đức, TP.HCM', 'Ba'),
(9, 28, 'Võ Thị Mai', '0956789012', '987 Lê Văn Việt, Q.Thủ Đức, TP.HCM', 'Mẹ'),
(10, 27, 'Đỗ Văn Phong', '0967890123', '147 Điện Biên Phủ, Q.1, TP.HCM', 'Ba'),
(11, 26, 'Bùi Thị Linh', '0978901234', '258 Nguyễn Oanh, Q.Gò Vấp, TP.HCM', 'Mẹ'),
(12, 25, 'Cao Minh Đức', '0989012345', '369 Võ Văn Ngân, Q.Thủ Đức, TP.HCM', 'Ba'),
(13, 24, 'Lâm Thị Xuân', '0990123456', '741 Pasteur, Q.1, TP.HCM', 'Mẹ'),
(131, 34, 'tespa', '0591258322', '123 Nguyễn Văn Cừ.', 'Mẹ');

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
  `student_pickup_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `route_stops`
--

INSERT INTO `route_stops` (`id`, `route_id`, `stop_id`, `stop_order`, `student_pickup_count`, `created_at`) VALUES
(133, 1, 44, 0, 0, '2025-11-17 15:13:40'),
(134, 1, 1, 1, 2, '2025-11-17 15:13:40'),
(135, 1, 48, 2, 3, '2025-11-17 15:13:40'),
(136, 1, 45, 3, 2, '2025-11-17 15:13:40'),
(137, 1, 43, 99, 0, '2025-11-17 15:13:40'),
(138, 2, 49, 0, 0, '2025-11-17 15:13:40'),
(139, 2, 50, 1, 3, '2025-11-17 15:13:40'),
(140, 2, 51, 2, 4, '2025-11-17 15:13:40'),
(141, 2, 43, 99, 0, '2025-11-17 15:13:40'),
(142, 3, 43, 0, 0, '2025-11-17 15:13:40'),
(143, 3, 57, 1, 2, '2025-11-17 15:13:40'),
(144, 3, 56, 2, 4, '2025-11-17 15:13:40'),
(145, 3, 55, 3, 3, '2025-11-17 15:13:40'),
(146, 3, 54, 99, 0, '2025-11-17 15:13:40'),
(147, 4, 43, 0, 0, '2025-11-17 15:13:40'),
(148, 4, 51, 1, 3, '2025-11-17 15:13:40'),
(149, 4, 50, 2, 4, '2025-11-17 15:13:40'),
(150, 4, 49, 99, 0, '2025-11-17 15:13:40'),
(151, 5, 43, 0, 0, '2025-11-17 15:13:40'),
(152, 5, 2, 1, 3, '2025-11-17 15:13:40'),
(153, 5, 48, 2, 2, '2025-11-17 15:13:40'),
(154, 5, 1, 3, 2, '2025-11-17 15:13:40'),
(155, 5, 44, 99, 0, '2025-11-17 15:13:40'),
(156, 6, 54, 0, 0, '2025-11-17 15:13:40'),
(157, 6, 55, 1, 3, '2025-11-17 15:13:40'),
(158, 6, 52, 2, 4, '2025-11-17 15:13:40'),
(159, 6, 57, 3, 2, '2025-11-17 15:13:40'),
(160, 6, 43, 99, 0, '2025-11-17 15:13:40');

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

INSERT INTO `schedules` (`id`, `driver_id`, `bus_id`, `route_id`, `date`, `shift_type`, `scheduled_start_time`, `scheduled_end_time`, `student_count`, `status`, `actual_start_time`, `actual_end_time`, `notes`, `created_at`, `updated_at`) VALUES
(4, 2, 3, 2, '2025-11-09', 'morning', '06:30:00', '07:30:00', 30, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-11-12 05:20:38'),
(6, 3, 6, 6, '2025-11-09', 'morning', '06:45:00', '07:45:00', 30, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-11-12 05:22:18'),
(10, 3, 6, 3, '2025-11-09', 'afternoon', '17:00:00', '18:00:00', 30, 'scheduled', NULL, NULL, NULL, '2025-10-24 05:00:15', '2025-11-12 05:22:32'),
(23, 1, 1, 5, '2025-10-23', 'afternoon', '17:30:00', '18:30:00', 30, 'scheduled', NULL, NULL, NULL, '2025-11-07 10:26:54', '2025-11-11 04:45:27'),
(24, 1, 1, 1, '2025-10-23', 'morning', '06:30:00', '07:30:00', 30, 'scheduled', NULL, NULL, NULL, '2025-11-07 10:28:15', '2025-11-12 05:21:45'),
(26, 2, 3, 4, '2025-11-09', 'afternoon', '17:30:00', '18:30:00', 30, 'scheduled', NULL, NULL, NULL, '2025-11-07 10:42:35', '2025-11-12 05:21:33'),
(28, 1, 2, 6, '2025-11-09', 'morning', '06:20:00', '07:10:00', 30, 'scheduled', NULL, NULL, NULL, '2025-11-08 16:02:52', '2025-11-09 05:47:39'),
(31, 1, 2, 3, '2025-11-09', 'afternoon', '17:30:00', '18:55:00', 30, 'scheduled', NULL, NULL, NULL, '2025-11-09 05:23:17', '2025-11-12 05:10:14'),
(34, 1, 1, 1, '2025-11-10', 'morning', '06:30:00', '07:30:00', 30, 'scheduled', NULL, NULL, NULL, '2025-11-09 16:04:16', '2025-11-11 04:45:07'),
(35, 1, 2, 5, '2025-11-10', 'afternoon', '17:00:00', '17:40:00', 30, 'scheduled', NULL, NULL, NULL, '2025-11-10 14:47:18', '2025-11-10 14:47:18'),
(37, 1, 3, 2, '2025-11-11', 'morning', '06:00:00', '06:50:00', 30, 'scheduled', NULL, NULL, 'lịch mới', '2025-11-18 03:52:45', '2025-11-18 03:52:45'),
(38, 1, 7, 4, '2025-11-11', 'afternoon', '06:00:00', '06:50:00', 30, 'scheduled', NULL, NULL, 'lên lịch', '2025-11-18 04:05:40', '2025-11-18 04:07:29');

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
(44, 'Cong vien 23/9', 'Đường Lê Lai, Phường Phạm Ngũ Lão, Quận 1, TP.HCM', 10.76925000, 106.69242000, 'active'),
(45, 'Dinh Độc Lập', '135 Nam Kỳ Khởi Nghĩa, P. Bến Thành, Q.1, TP.HCM', 10.77700000, 106.69540000, 'active'),
(46, 'Nga Sau Phu Dong', '240 Pham Van Dong, P. Hiep Binh Chanh, Thu Duc', 10.83290000, 106.72030000, 'active'),
(47, 'Nga Tu Hang Xanh', 'Giao lo Xo Viet Nghe Tinh & Dien Bien Phu, P.21, Q.Binh Thanh', 10.79610000, 106.70370000, 'active'),
(48, 'Ben Thanh', '1 Le Loi, P. Ben Nghe, Q.1, TP.HCM', 10.77260000, 106.69800000, 'active'),
(49, 'Cong vien Lang Hoa', '1040 Quang Trung, P.8, Go Vap, TP.HCM', 10.83710000, 106.67950000, 'active'),
(50, 'Nga Tu Phan Van Tri - Le Duc Tho', '197 Le Duc Tho, P.6, Go Vap, TP.HCM', 10.84200000, 106.68500000, 'active'),
(51, 'Nga Nam Chuong Cho', '789 Quang Trung, Go Vap, TP.HCM', 10.83950000, 106.68260000, 'active'),
(52, 'Cau vuot Nguyen Thai Son', 'Vòng xoay Nguyễn Thái Sơn, Phường 3, Gò Vấp, TP.HCM', 10.81665000, 106.67725000, 'active'),
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
  `morning_route_id` int(11) DEFAULT NULL COMMENT 'ID tuyến xe đón buổi sáng',
  `afternoon_route_id` int(11) DEFAULT NULL COMMENT 'ID tuyến xe trả buổi chiều',
  `morning_pickup_stop_id` int(11) DEFAULT NULL COMMENT 'ID của điểm dừng đón học sinh (tham chiếu stops.id)',
  `afternoon_dropoff_stop_id` int(11) DEFAULT NULL COMMENT 'ID của điểm dừng trả học sinh (tham chiếu stops.id)',
  `pickup_time` time DEFAULT NULL,
  `dropoff_time` time DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `students`
--

INSERT INTO `students` (`id`, `name`, `grade`, `class_id`, `class`, `address`, `phone`, `parent_id`, `morning_route_id`, `afternoon_route_id`, `morning_pickup_stop_id`, `afternoon_dropoff_stop_id`, `pickup_time`, `dropoff_time`, `status`) VALUES
(4, 'Nguyễn Minh Khang', '6', 1, '6A1', '123 Nguyễn Thái Học, Q.1, TP.HCM', '0901234567', 4, 1, 5, 1, 2, NULL, NULL, 'active'),
(5, 'Trần Thùy Linh', '6', 2, '6A2', '456 Lê Văn Sỹ, Q.3, TP.HCM', '0912345678', 5, 2, 4, 50, 52, NULL, NULL, 'active'),
(6, 'Lê Tuấn Anh', '7', 6, '7A1', '789 Võ Văn Tần, Q.Gò Vấp, TP.HCM', '0923456789', 6, 6, 3, 57, 57, NULL, NULL, 'active'),
(7, 'Phạm Hoài An', '7', 7, '7A2', '321 Phan Văn Trị, Q.Gò Vấp, TP.HCM', '0934567890', 7, 6, 3, 56, 56, NULL, NULL, 'active'),
(8, 'Hoàng Nam Phong', '8', 10, '8A1', '654 Kha Vạn Cân, Q.Thủ Đức, TP.HCM', '0945678901', 8, 1, 5, 46, 2, NULL, NULL, 'active'),
(9, 'Võ Mai Phương', '6', 3, '6A3', '987 Lê Văn Việt, Q.Thủ Đức, TP.HCM', '0956789012', 9, 2, 4, 51, 53, NULL, NULL, 'active'),
(10, 'Đỗ Phong Vũ', '7', 8, '7B1', '147 Điện Biên Phủ, Q.1, TP.HCM', '0967890123', 10, 6, 3, 56, 57, NULL, NULL, 'active'),
(11, 'Bùi Linh Chi', '6', 4, '6B1', '258 Nguyễn Oanh, Q.Gò Vấp, TP.HCM', '0978901234', 11, 1, 5, 2, 48, NULL, NULL, 'active'),
(12, 'Cao Đức Minh', '7', 9, '7B2', '369 Võ Văn Ngân, Q.Thủ Đức, TP.HCM', '0989012345', 12, 2, 4, 52, 53, NULL, NULL, 'active'),
(13, 'Lâm Xuân Mai', '6', 5, '6B2', '741 Pasteur, Q.1, TP.HCM', '0990123456', 13, 6, 3, 55, 56, NULL, NULL, 'active'),
(131, 'teststudent', '6', 4, '6B1', 'ko có\n', '0389142313', 6, 6, 3, 57, 55, NULL, NULL, 'active'),
(132, 'Kim Vinh Trương 2', '6', 4, '6B1', '123 duong a', '9502834923', 131, 2, 4, 51, 53, NULL, NULL, 'active');

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
(7, 'driver3', 'driver3@school.com', '$2b$10$hashed_password_driver3', 'driver', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(24, 'pa1', 'pa1@gmail.com', '$2a$10$dxwXV7sVD3VClgXz0N/h5u9zdbzcMLAyGAXS99QY9dgGUVEGyQHi.', 'parent', '2025-11-12 04:54:45', '2025-11-12 04:54:45'),
(25, 'pa2', 'pa2@gmail.com', '$2a$10$QVDnwDN7SR5QkwpYoE5TbOkXt3G2EUTRfdQ2eq5kD2/hkMUl4.Y8.', 'parent', '2025-11-12 04:55:01', '2025-11-12 04:55:01'),
(26, 'pa3', 'pa3@gmail.com', '$2a$10$v0i83IqYscGyoM6NpvLOXe0nU/f9DdC4ftGt1L5X6/tcz3B.PGiBq', 'parent', '2025-11-12 05:03:23', '2025-11-12 05:03:23'),
(27, 'pa4', 'pa4@gmail.com', '$2a$10$v5aqe.g0HL.HlJbDHui4IesMVqee/KR2egNNa8k1pPGKL7pPvW4oK', 'parent', '2025-11-12 05:03:42', '2025-11-12 05:03:42'),
(28, 'pa5', 'pa5@gmail.com', '$2a$10$2/77GNnApY3e.P2faL5X1.vjvXNDKkB/dq8LHQt2wCOZsRM.0AkIK', 'parent', '2025-11-12 05:04:00', '2025-11-12 05:04:00'),
(29, 'pa6', 'pa6@gmail.com', '$2a$10$0lKbgkqAUWz/xHwub4jzy.Dy7jTHyXmt9tr4hgexIKh3Ur3nGlRPC', 'parent', '2025-11-12 05:04:14', '2025-11-12 05:04:14'),
(30, 'pa10', 'pa10@gmail.com', '$2a$10$t5vqDiR3IFTqM.35dJZUeuPmfNhqAIYso3mcuJwWC3Xc6aocGXG72', 'parent', '2025-11-12 05:04:40', '2025-11-12 05:04:40'),
(31, 'pa9', 'pa9@gmail.com', '$2a$10$lJGetOoQLnf2M42m8alZmOLPwO0MaTfolFo/ZUDCiQUYB66ewO6p6', 'parent', '2025-11-12 05:04:55', '2025-11-12 05:04:55'),
(32, 'pa7', 'pa7@gmail.com', '$2a$10$vyUtHsmkpZBHqby/mxc3JuLUxqjpTRGR7BCpELYE2mngdBGZQsMY2', 'parent', '2025-11-12 05:05:08', '2025-11-12 05:05:08'),
(33, 'pa8', 'pa8@gmail.com', '$2a$10$3aGDHD2Ry4.nbeHXe1nP1e3jWD6P8Xhy8FC.FgaP6ddGikpEiN8hC', 'parent', '2025-11-12 05:05:21', '2025-11-12 05:05:21'),
(34, 'testerpa', 'tespa@gmail.com', '$2a$10$NoIAibKEFHTM0dbEBrGgc.f02PhrZBuGKIK1e8HoG7DFmkYkk29Si', 'parent', '2025-11-12 05:29:01', '2025-11-12 05:29:01');

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
  ADD UNIQUE KEY `unique_driver_date_shift` (`driver_id`,`date`,`shift_type`),
  ADD UNIQUE KEY `schedules_bus_date_shift` (`bus_id`,`date`,`shift_type`),
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
  ADD KEY `class_id` (`class_id`),
  ADD KEY `idx_class_id` (`class_id`),
  ADD KEY `fk_morning_pickup_stop` (`morning_pickup_stop_id`),
  ADD KEY `fk_afternoon_dropoff_stop` (`afternoon_dropoff_stop_id`),
  ADD KEY `fk_morning_route` (`morning_route_id`),
  ADD KEY `fk_afternoon_route` (`afternoon_route_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `parents`
--
ALTER TABLE `parents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT cho bảng `routes`
--
ALTER TABLE `routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `route_stops`
--
ALTER TABLE `route_stops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT cho bảng `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT cho bảng `stops`
--
ALTER TABLE `stops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT cho bảng `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

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
  ADD CONSTRAINT `fk_afternoon_route` FOREIGN KEY (`afternoon_route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_morning_pickup_stop` FOREIGN KEY (`morning_pickup_stop_id`) REFERENCES `stops` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_morning_route` FOREIGN KEY (`morning_route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_4` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
