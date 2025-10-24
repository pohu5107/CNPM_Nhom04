#   Cập nhật Database

### **Bước 1: Import database gốc (lần đầu tiên)**
```sql
-- Tạo database mới
CREATE DATABASE school_bus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Import database gốc
mysql -u root -p school_bus_db < school_bus_db.sql
```

### **Bước 2: Chạy script cập nhật **
```sql
-- Chạy script sửa lỗi và thêm bảng classes
mysql -u root -p school_bus_db < database_simple_fix.sql
```

### **Bước 3: Cập nhật lịch trình xe buýt**
```sql
-- Tạo lại bảng schedules và route_stops với dữ liệu mới
mysql -u root -p school_bus_db < complete_schedules_setup.sql
```

### **Bước 4: Sửa lỗi thời gian điểm dừng (Mới - 2025-10-24)**
```sql
-- QUAN TRỌNG: Chạy script này để sửa logic thời gian điểm dừng
mysql -u root -p school_bus_db < database_updates_fix_timing_logic.sql
```



1. **Luôn chạy `database_simple_fix.sql` sau khi import `school_bus_db.sql`**
2. **Không skip bước 2** - Backend sẽ lỗi nếu thiếu bảng `classes` và VIEWs
3. **Bước 3 chạy khi cần cập nhật lịch trình** - Script sẽ XÓA và tạo lại bảng `schedules` + `route_stops`
4. **⚠️ QUAN TRỌNG: Phải chạy Bước 4** - Sửa lỗi thời gian điểm dừng (2025-10-24)
5. **Nếu đã có database cũ:** Backup trước khi update

## ** Thứ tự chạy scripts (QUAN TRỌNG):**
```bash
# 1. Database gốc
mysql -u root -p school_bus_db < school_bus_db.sql

# 2. Sửa lỗi cơ bản  
mysql -u root -p school_bus_db < database_simple_fix.sql

# 3. Tạo lịch trình
mysql -u root -p school_bus_db < complete_schedules_setup.sql

# 4. Sửa logic thời gian (MỚI - bắt buộc)
mysql -u root -p school_bus_db < database_updates_fix_timing_logic.sql
```

## ** Cấu trúc Database sau khi update:**

### **Bảng mới (database_simple_fix.sql):**
-  `classes` - Quản lý lớp học (6A1, 6A2, 7B1...)

### **Bảng mới (complete_schedules_setup.sql):**
-  `schedules` - Lịch trình làm việc của tài xế
-  `route_stops` - Trạm dừng trên tuyến đường

### **Cập nhật mới (database_updates_fix_timing_logic.sql - 2025-10-24):**
- **Thêm 3 routes mới**: 
  - "Tuyến Gò Vấp - Chiều" (tách riêng ca chiều)
  - "Tuyến Quận 1 - Chiều" (bổ sung ca chiều)  
  - "Tuyến Thủ Đức - Sáng" (bổ sung ca sáng)
- **6 routes hoàn chỉnh**: 3 tuyến x 2 ca (sáng/chiều)
- **Sửa `route_stops`**: Chuyển từ thời gian tuyệt đối sang offset pattern
- **Logic mới**: `estimated_arrival_time` = offset từ `schedule.start_time`
- **Sửa schedule mapping**: Driver dùng đúng route theo ca làm việc
- **Ví dụ**: `00:10:00` = +10 phút từ thời gian bắt đầu chuyến

### **Sửa lỗi:**  
-  `students.parent_id` → `parents.id` (thay vì `users.id`)
-  `students.class_id` → `classes.id`

### **VIEWs:**
-  `view_students_with_parents` - Join students + parents + classes
-  `view_parent_children_count` - Thống kê con của phụ huynh  
-  `view_class_statistics` - Thống kê học sinh theo lớp

 

```sql
-- Test 1: Kiểm tra bảng classes
SELECT COUNT(*) FROM classes; -- Phải có 13 lớp

-- Test 2: Kiểm tra VIEW
SELECT COUNT(*) FROM view_students_with_parents; -- Phải có 3 học sinh

-- Test 3: Kiểm tra bảng schedules (nếu đã chạy complete_schedules_setup.sql)
SELECT COUNT(*) FROM schedules; -- Phải có 10 lịch trình
SELECT COUNT(*) FROM route_stops; -- Phải có 18 trạm dừng (6 routes x 3 stops)
SELECT COUNT(*) FROM routes; -- Phải có 6 routes (3 tuyến x 2 ca)

-- Test 5: Kiểm tra routes hoàn chỉnh (sau khi chạy database_updates_fix_timing_logic.sql)
SELECT route_name FROM routes ORDER BY route_name; 
-- Phải có đầy đủ:
-- Tuyến Gò Vấp - Chiều, Tuyến Gò Vấp - Sáng
-- Tuyến Quận 1 - Chiều, Tuyến Quận 1 - Sáng  
-- Tuyến Thủ Đức - Chiều, Tuyến Thủ Đức - Sáng

-- Test 4: Kiểm tra foreign key
SHOW CREATE TABLE students; -- Phải có constraint đúng
```

## ** Backend Endpoints cần:**

- `GET /api/students` - Cần VIEW `view_students_with_parents`
- `GET /api/parents` - Cần VIEW `view_parent_children_count`
- `GET /api/classes` - Cần bảng `classes`
- `GET /api/schedules` - Cần bảng `schedules` và `route_stops`

## ** Files trong thư mục:**

- `school_bus_db.sql` - Database gốc (chạy đầu tiên)
- `database_simple_fix.sql` - Sửa lỗi + thêm bảng classes (chạy thứ 2)
- `complete_schedules_setup.sql` - Tạo lại lịch trình xe buýt (chạy thứ 3)
- `database_updates_fix_timing_logic.sql` - **MỚI**: Sửa logic thời gian điểm dừng (chạy thứ 4 - bắt buộc)

## ** Giải thích thay đổi mới (2025-10-24):**

### **Vấn đề trước đây:**
- Route stops có thời gian tuyệt đối (06:45, 07:00, 07:15)
- Schedule có thời gian khác (07:00-08:00) 
- Thiếu routes: chỉ có 4 routes thay vì 6 (3 tuyến x 2 ca)
- Driver 3 ca sáng phải dùng route chiều vì thiếu "Tuyến Thủ Đức - Sáng"
- Kết quả: Điểm dừng 06:45 trước thời gian bắt đầu chuyến 07:00 ❌

### **Giải pháp mới:**
- **Bổ sung routes**: Tạo đủ 6 routes (3 tuyến x 2 ca)
- **Route stops dùng offset**: (00:10:00, 00:25:00, 00:40:00)
- **Backend tính động**: `actual_time = schedule.start_time + offset`
- **Schedule mapping đúng**: Mỗi driver dùng route phù hợp với ca làm việc
- **Kết quả**: Thời gian nhất quán và logic ✅

### **Routes hoàn chỉnh sau khi update:**
```
1. Tuyến Quận 1 - Sáng    4. Tuyến Gò Vấp - Chiều
2. Tuyến Quận 1 - Chiều   5. Tuyến Thủ Đức - Sáng  
3. Tuyến Gò Vấp - Sáng    6. Tuyến Thủ Đức - Chiều
```

### **Ví dụ thực tế:**
```
Schedule: 06:30-07:30
Route stops: 00:10:00, 00:25:00, 00:40:00
Kết quả: 06:40, 06:55, 07:10 

Schedule: 17:00-18:00  
Route stops: 00:10:00, 00:25:00, 00:40:00
Kết quả: 17:10, 17:25, 17:40 
``` 

