-- Fix route data để có tuyến đường logic hơn cho việc vẽ polyline

-- Xóa dữ liệu route_stops cũ
DELETE FROM route_stops;

-- Thêm dữ liệu route_stops mới với tuyến đường logic

-- Route 1: Tuyến Quận 1 - Sáng (logic: đi theo vòng tròn Q1)
INSERT INTO route_stops (route_id, stop_id, stop_order, student_pickup_count) VALUES
(1, 44, 0, 0),  -- Công viên 23/9 (điểm xuất phát)
(1, 1, 1, 2),   -- Nhà Văn hóa Thanh Niên (gần công viên)
(1, 48, 2, 3),  -- Bến Thành (trung tâm Q1)
(1, 2, 3, 2),   -- Ngã tư Hàng Xanh (ra khỏi Q1)
(1, 43, 99, 0); -- Trường THCS Nguyễn Du (điểm đến cuối)

-- Route 2: Tuyến Gò Vấp - Sáng (logic: đi theo tuyến Gò Vấp)
INSERT INTO route_stops (route_id, stop_id, stop_order, student_pickup_count) VALUES
(2, 49, 0, 0),  -- Công viên Làng Hoa (điểm xuất phát)
(2, 50, 1, 3),  -- Ngã tư Phan Văn Trị - Lê Đức Thọ
(2, 51, 2, 4),  -- Ngã Năm Chương Cho
(2, 43, 99, 0); -- Trường THCS Nguyễn Du (điểm đến cuối)

-- Route 3: Tuyến Thủ Đức - Chiều (logic: từ trường về Thủ Đức)
INSERT INTO route_stops (route_id, stop_id, stop_order, student_pickup_count) VALUES
(3, 43, 0, 0),  -- Trường THCS Nguyễn Du (điểm xuất phát)
(3, 57, 1, 2),  -- Cầu Sài Gòn
(3, 52, 2, 4),  -- Cầu vượt Nguyễn Thái Sơn
(3, 55, 3, 3),  -- Vincom Thủ Đức
(3, 54, 99, 0); -- Chung cư Sunview Town (điểm đến cuối)

-- Route 4: Tuyến Gò Vấp - Chiều (logic: từ trường về Gò Vấp)
INSERT INTO route_stops (route_id, stop_id, stop_order, student_pickup_count) VALUES
(4, 43, 0, 0),  -- Trường THCS Nguyễn Du (điểm xuất phát)
(4, 51, 1, 3),  -- Ngã Năm Chương Cho
(4, 50, 2, 4),  -- Ngã tư Phan Văn Trị - Lê Đức Thọ
(4, 49, 99, 0); -- Công viên Làng Hoa (điểm đến cuối)

-- Route 5: Tuyến Quận 1 - Chiều (logic: từ trường về Q1)
INSERT INTO route_stops (route_id, stop_id, stop_order, student_pickup_count) VALUES
(5, 43, 0, 0),  -- Trường THCS Nguyễn Du (điểm xuất phát)
(5, 2, 1, 3),   -- Ngã tư Hàng Xanh
(5, 48, 2, 2),  -- Bến Thành
(5, 1, 3, 2),   -- Nhà Văn hóa Thanh Niên
(5, 44, 99, 0); -- Công viên 23/9 (điểm đến cuối)

-- Route 6: Tuyến Thủ Đức - Sáng (logic: từ Thủ Đức đến trường)
INSERT INTO route_stops (route_id, stop_id, stop_order, student_pickup_count) VALUES
(6, 54, 0, 0),  -- Chung cư Sunview Town (điểm xuất phát)
(6, 55, 1, 3),  -- Vincom Thủ Đức
(6, 52, 2, 4),  -- Cầu vượt Nguyễn Thái Sơn
(6, 57, 3, 2),  -- Cầu Sài Gòn
(6, 43, 99, 0); -- Trường THCS Nguyễn Du (điểm đến cuối)