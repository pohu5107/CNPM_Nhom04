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
-- 1. ADD NEW ROUTE FOR AFTERNOON SHIFT
-- =====================================================

-- Add "Tuyến Gò Vấp - Chiều" route for afternoon schedules
INSERT INTO routes (route_name, distance, status, created_at) 
VALUES ('Tuyến Gò Vấp - Chiều', 22.00, 'active', NOW());

-- Get the new route_id (should be 4 if following sequence)
SET @new_route_id = LAST_INSERT_ID();

-- =====================================================
-- 2. CREATE ROUTE STOPS FOR NEW AFTERNOON ROUTE
-- =====================================================

-- Copy stops structure from route 2 but with afternoon offset times
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_arrival_time, student_pickup_count, created_at)
SELECT @new_route_id, stop_id, stop_order, 
  CASE stop_order
    WHEN 1 THEN '00:10:00'  -- +10 minutes offset from start_time
    WHEN 2 THEN '00:25:00'  -- +25 minutes offset from start_time
    WHEN 3 THEN '00:40:00'  -- +40 minutes offset from start_time
  END as estimated_arrival_time,
  student_pickup_count,
  NOW()
FROM route_stops 
WHERE route_id = 2;

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

-- Move afternoon schedules from route 2 to the new route 4
-- This ensures afternoon schedules use "Tuyến Gò Vấp - Chiều" instead of "Tuyến Gò Vấp - Sáng"
UPDATE schedules 
SET route_id = @new_route_id,
    updated_at = NOW()
WHERE route_id = 2 AND shift_type = 'afternoon';

