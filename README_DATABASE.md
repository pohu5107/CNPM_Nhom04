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

## ** Lưu ý **

1. **Luôn chạy `database_simple_fix.sql` sau khi import `school_bus_db.sql`**
2. **Không skip bước 2** - Backend sẽ lỗi nếu thiếu bảng `classes` và VIEWs
3. **Bước 3  chạy khi cần cập nhật lịch trình** - Script sẽ XÓA và tạo lại bảng `schedules` + `route_stops`
4. **Nếu đã có database cũ:** Backup trước khi update

## ** Cấu trúc Database sau khi update:**

### **Bảng mới (database_simple_fix.sql):**
-  `classes` - Quản lý lớp học (6A1, 6A2, 7B1...)

### **Bảng mới (complete_schedules_setup.sql):**
-  `schedules` - Lịch trình làm việc của tài xế
-  `route_stops` - Trạm dừng trên tuyến đường

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
SELECT COUNT(*) FROM route_stops; -- Phải có 9 trạm dừng

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
- `complete_schedules_setup.sql` - Tạo lại lịch trình xe buýt 

