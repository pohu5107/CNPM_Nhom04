1. Bảng schedules (Lịch trình)
Loại bỏ các cột: start_time, end_time, start_point, end_point, estimated_duration, max_capacity.

Thêm các cột: actual_start_time (thời gian bắt đầu thực tế) và actual_end_time (thời gian kết thúc thực tế).

2. Bảng route_stops (Các điểm dừng của tuyến)
Thay đổi quan hệ: Bảng này giờ đây quản lý điểm bắt đầu và kết thúc (thay cho các cột đã bị xóa trong schedules).

Sử dụng cột stop_order để xác định thứ tự (0 = bắt đầu, 99 = kết thúc).

Thêm cột: estimated_arrival_time (thời gian dự kiến đến từng trạm).



4. Bảng stops (Điểm dừng)
Thêm cột: Tọa độ GPS.

5. Bảng buses (Xe buýt)
Thêm cột: capacity (sức chứa).
