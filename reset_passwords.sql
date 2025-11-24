-- Script để reset tất cả passwords theo pattern mới
-- Chạy script này trong MySQL/phpMyAdmin để cập nhật passwords

USE school_bus_db;

-- Reset password cho tất cả admin thành 'admin123'
UPDATE users SET password = 'admin123' WHERE role = 'admin';

-- Reset password cho tất cả driver thành 'driver123'
UPDATE users SET password = 'driver123' WHERE role = 'driver';

-- Reset password cho tất cả parent thành 'parent123'
UPDATE users SET password = 'parent123' WHERE role = 'parent';

-- Kiểm tra kết quả
SELECT id, username, email, password, role FROM users ORDER BY role, username;

-- Thông báo hoàn thành
SELECT 'Password reset completed successfully!' as message;