-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 20, 2025 lúc 03:57 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

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
  `status` enum('active','maintenance','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `buses`
--

INSERT INTO `buses` (`id`, `bus_number`, `license_plate`, `status`, `created_at`) VALUES
(1, 'BUS-01', '51K-123.45', 'active', '2025-10-20 13:44:19'),
(2, 'BUS-02', '51K-678.90', 'active', '2025-10-20 13:44:19'),
(3, 'BUS-03', '51K-111.22', 'maintenance', '2025-10-20 13:44:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bus_routes`
--

CREATE TABLE `bus_routes` (
  `id` int(11) NOT NULL,
  `bus_id` int(11) DEFAULT NULL,
  `route_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bus_routes`
--

INSERT INTO `bus_routes` (`id`, `bus_id`, `route_id`, `created_at`) VALUES
(1, 1, 1, '2025-10-20 13:44:19'),
(2, 2, 2, '2025-10-20 13:44:19'),
(3, 1, 3, '2025-10-20 13:44:19');

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
(2, 3, 'Trần Thị B', '0912345678', 'A1-54321', NULL, 'active', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(3, 7, 'Lê Văn C', '0923456789', 'A1-98765', NULL, 'inactive', '2025-10-20 13:44:19', '2025-10-20 13:44:19');

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
(1, 4, 'Trần Văn Dũng', '0987654321', NULL, 'Ba'),
(2, 5, 'Lê Thị Ngọc', '0977654321', NULL, 'Mẹ'),
(3, 6, 'Phạm Văn An', '0967654321', NULL, 'Ba');

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
(3, 'Tuyến Thủ Đức - Chiều', 18.20, 'active', '2025-10-20 13:44:19');

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
(3, 'Gigamall Thủ Đức', '240 Phạm Văn Đồng, P. Hiệp Bình Chánh, Thủ Đức', 10.83290000, 106.72030000, 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `grade` varchar(20) DEFAULT NULL,
  `class` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `route_id` int(11) DEFAULT NULL,
  `bus_id` int(11) DEFAULT NULL,
  `pickup_time` time DEFAULT NULL,
  `dropoff_time` time DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `students`
--

INSERT INTO `students` (`id`, `name`, `grade`, `class`, `address`, `phone`, `parent_id`, `route_id`, `bus_id`, `pickup_time`, `dropoff_time`, `status`) VALUES
(1, 'Trần Dũng Minh', '6', '6A1', NULL, NULL, 4, 1, 1, '06:30:00', '16:30:00', 'active'),
(2, 'Lê Ngọc Anh', '7', '7B2', NULL, NULL, 5, 2, 2, '06:45:00', '16:45:00', 'active'),
(3, 'Phạm An Khang', '6', '6A1', NULL, NULL, 6, 1, 1, '06:40:00', '16:30:00', 'active');

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
(1, 'admin', 'admin@school.com', 'admin123', 'admin', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(2, 'driver1', 'driver1@school.com', '$2b$10$hashed_password_driver1', 'driver', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(3, 'driver2', 'driver2@school.com', '$2b$10$hashed_password_driver2', 'driver', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(4, 'parent1', 'parent1@gmail.com', 'parent123', 'parent', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(5, 'parent2', 'parent2@gmail.com', '$2b$10$hashed_password_parent2', 'parent', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(6, 'parent3', 'parent3@gmail.com', '$2b$10$hashed_password_parent3', 'parent', '2025-10-20 13:44:19', '2025-10-20 13:44:19'),
(7, 'driver3', 'driver3@school.com', '$2b$10$hashed_password_driver3', 'driver', '2025-10-20 13:44:19', '2025-10-20 13:44:19');

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
-- Chỉ mục cho bảng `bus_routes`
--
ALTER TABLE `bus_routes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_bus_route` (`bus_id`,`route_id`),
  ADD KEY `route_id` (`route_id`);

--
-- Chỉ mục cho bảng `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD KEY `user_id` (`user_id`);

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
  ADD KEY `bus_id` (`bus_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `bus_routes`
--
ALTER TABLE `bus_routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `parents`
--
ALTER TABLE `parents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `routes`
--
ALTER TABLE `routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `stops`
--
ALTER TABLE `stops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
-- Các ràng buộc cho bảng `bus_routes`
--
ALTER TABLE `bus_routes`
  ADD CONSTRAINT `bus_routes_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bus_routes_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `parents`
--
ALTER TABLE `parents`
  ADD CONSTRAINT `parents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_ibfk_3` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
