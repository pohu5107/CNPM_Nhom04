-- =====================================================
-- DATABASE UPDATES: Fix Timing Logic for Route Stops
-- =====================================================
-- Created: 2025-10-24
-- Purpose: Fix timing inconsistency between schedules and route stops
-- Changes: 
--   1. Add new route for afternoon shift (Gò Vấp - Chiều)
--   2. Update route_stops to use offset pattern instead of absolute time
--   3. Update schedules to use correct routes

-- =====================================================
-- 1. ADD NEW ROUTES FOR COMPLETE MORNING/AFTERNOON COVERAGE
-- =====================================================

-- Add "Tuyến Gò Vấp - Chiều" route for afternoon schedules  
INSERT INTO routes (route_name, distance, status, created_at) 
VALUES ('Tuyến Gò Vấp - Chiều', 22.00, 'active', NOW());

-- Add missing routes for complete coverage (6 routes total: 3 locations x 2 shifts)
INSERT INTO routes (route_name, distance, status, created_at) VALUES 
('Tuyến Quận 1 - Chiều', 15.50, 'active', NOW()),
('Tuyến Thủ Đức - Sáng', 18.20, 'active', NOW());

-- Get the new route_ids (should be 4, 5, 6 if following sequence)
SET @govat_chieu_route_id = (SELECT id FROM routes WHERE route_name = 'Tuyến Gò Vấp - Chiều' ORDER BY created_at DESC LIMIT 1);
SET @quan1_chieu_route_id = (SELECT id FROM routes WHERE route_name = 'Tuyến Quận 1 - Chiều' ORDER BY created_at DESC LIMIT 1);
SET @thuduc_sang_route_id = (SELECT id FROM routes WHERE route_name = 'Tuyến Thủ Đức - Sáng' ORDER BY created_at DESC LIMIT 1);

-- =====================================================
-- 2. CREATE ROUTE STOPS FOR ALL NEW ROUTES
-- =====================================================

-- Copy stops for "Tuyến Gò Vấp - Chiều" from route 2 (Gò Vấp - Sáng)
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_arrival_time, student_pickup_count, created_at)
SELECT @govat_chieu_route_id, stop_id, stop_order, 
  CASE stop_order
    WHEN 1 THEN '00:10:00'  -- +10 minutes offset from start_time
    WHEN 2 THEN '00:25:00'  -- +25 minutes offset from start_time
    WHEN 3 THEN '00:40:00'  -- +40 minutes offset from start_time
  END as estimated_arrival_time,
  student_pickup_count,
  NOW()
FROM route_stops 
WHERE route_id = 2;

-- Copy stops for "Tuyến Quận 1 - Chiều" from route 1 (Quận 1 - Sáng)
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_arrival_time, student_pickup_count, created_at)
SELECT @quan1_chieu_route_id, stop_id, stop_order, 
  CASE stop_order
    WHEN 1 THEN '00:10:00'
    WHEN 2 THEN '00:25:00' 
    WHEN 3 THEN '00:40:00'
  END as estimated_arrival_time,
  student_pickup_count,
  NOW()
FROM route_stops 
WHERE route_id = 1;

-- Copy stops for "Tuyến Thủ Đức - Sáng" from route 3 (Thủ Đức - Chiều)
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_arrival_time, student_pickup_count, created_at)
SELECT @thuduc_sang_route_id, stop_id, stop_order,
  CASE stop_order
    WHEN 1 THEN '00:10:00'
    WHEN 2 THEN '00:25:00'
    WHEN 3 THEN '00:40:00' 
  END as estimated_arrival_time,
  student_pickup_count,
  NOW()
FROM route_stops 
WHERE route_id = 3;

-- =====================================================
-- 3. UPDATE EXISTING ROUTE_STOPS TO USE OFFSET PATTERN
-- =====================================================

-- Update Route 1 (Tuyến Quận 1 - Sáng) - use offset pattern
UPDATE route_stops SET 
  estimated_arrival_time = CASE stop_order
    WHEN 1 THEN '00:10:00'  -- +10 minutes offset
    WHEN 2 THEN '00:25:00'  -- +25 minutes offset  
    WHEN 3 THEN '00:40:00'  -- +40 minutes offset
  END,
  updated_at = NOW()
WHERE route_id = 1;

-- Update Route 2 (Tuyến Gò Vấp - Sáng) - use offset pattern
UPDATE route_stops SET 
  estimated_arrival_time = CASE stop_order
    WHEN 1 THEN '00:10:00'  -- +10 minutes offset
    WHEN 2 THEN '00:25:00'  -- +25 minutes offset
    WHEN 3 THEN '00:40:00'  -- +40 minutes offset
  END,
  updated_at = NOW()
WHERE route_id = 2;

-- Update Route 3 (Tuyến Thủ Đức - Chiều) - use offset pattern
UPDATE route_stops SET 
  estimated_arrival_time = CASE stop_order
    WHEN 1 THEN '00:10:00'  -- +10 minutes offset
    WHEN 2 THEN '00:25:00'  -- +25 minutes offset
    WHEN 3 THEN '00:40:00'  -- +40 minutes offset
  END,
  updated_at = NOW()
WHERE route_id = 3;

-- =====================================================
-- 4. UPDATE SCHEDULES TO USE CORRECT ROUTES
-- =====================================================

-- Move afternoon schedules from route 2 to new "Tuyến Gò Vấp - Chiều"
UPDATE schedules 
SET route_id = @govat_chieu_route_id,
    updated_at = NOW()
WHERE route_id = 2 AND shift_type = 'afternoon';

-- Fix driver 3 morning schedule to use "Tuyến Thủ Đức - Sáng" instead of "Chiều"
UPDATE schedules 
SET route_id = @thuduc_sang_route_id,
    updated_at = NOW()
WHERE route_id = 3 AND shift_type = 'morning';

