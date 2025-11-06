-- Test script: Kiểm tra logic phân công mới
-- Chạy để test migration và logic mới

-- 1. Kiểm tra số lượng học sinh theo từng trạng thái
SELECT 'THỐNG KÊ PHÂN CÔNG' as report_section;

SELECT 
  'Tổng học sinh active' as metric,
  COUNT(*) as value
FROM students 
WHERE status = 'active'

UNION ALL

SELECT 
  'Học sinh có route_id cũ' as metric,
  COUNT(*) as value  
FROM students 
WHERE route_id IS NOT NULL AND status = 'active'

UNION ALL

SELECT 
  'Tổng assignments mới' as metric,
  COUNT(*) as value
FROM student_route_assignments 
WHERE active = 1

UNION ALL

SELECT 
  CONCAT('Assignments ca ', shift_type) as metric,
  COUNT(*) as value
FROM student_route_assignments 
WHERE active = 1
GROUP BY shift_type;

-- 2. Test query "unassigned" cho ca sáng ngày mai
SELECT 'STUDENTS CHƯA PHÂN CÔNG CA SÁNG NGÀY MAI' as test_section;

SELECT s.id, s.name, s.class, c.class_name,
       current_route.route_name as current_other_shift
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN (
  SELECT sra.student_id, r.route_name
  FROM student_route_assignments sra
  JOIN routes r ON sra.route_id = r.id
  WHERE sra.active = 1
    AND sra.effective_start_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
    AND (sra.effective_end_date IS NULL OR sra.effective_end_date >= DATE_ADD(CURDATE(), INTERVAL 1 DAY))
    AND sra.shift_type != 'morning'
  GROUP BY sra.student_id
) current_route ON s.id = current_route.student_id
WHERE s.status = 'active'
  AND NOT EXISTS (
     SELECT 1 FROM student_route_assignments a
     WHERE a.student_id = s.id
       AND a.shift_type = 'morning'
       AND a.active = 1
       AND a.effective_start_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
       AND (a.effective_end_date IS NULL OR a.effective_end_date >= DATE_ADD(CURDATE(), INTERVAL 1 DAY))
  )
ORDER BY s.name 
LIMIT 10;

-- 3. Test query "assigned" cho tuyến 1, ca sáng ngày mai  
SELECT 'STUDENTS ĐÃ PHÂN CÔNG TUYẾN 1 CA SÁNG NGÀY MAI' as test_section;

SELECT a.*, 
       s.name AS student_name, c.class_name, s.class,
       r.route_name,
       ps.name AS pickup_stop_name, ds.name AS dropoff_stop_name
FROM student_route_assignments a
JOIN students s ON a.student_id = s.id
LEFT JOIN classes c ON s.class_id = c.id
JOIN routes r ON a.route_id = r.id
LEFT JOIN stops ps ON a.pickup_stop_id = ps.id
LEFT JOIN stops ds ON a.dropoff_stop_id = ds.id
WHERE a.route_id = 1
  AND a.shift_type = 'morning'
  AND a.active = 1
  AND a.effective_start_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
  AND (a.effective_end_date IS NULL OR a.effective_end_date >= DATE_ADD(CURDATE(), INTERVAL 1 DAY))
ORDER BY s.name;

-- 4. Test overlap detection (học sinh được assign 2 tuyến cùng lúc)
SELECT 'KIỂM TRA OVERLAP (Không nên có kết quả)' as test_section;

SELECT s.name, COUNT(*) as assignment_count, 
       GROUP_CONCAT(CONCAT(r.route_name, ' (', a.shift_type, ')')) as overlapping_routes
FROM student_route_assignments a
JOIN students s ON a.student_id = s.id  
JOIN routes r ON a.route_id = r.id
WHERE a.active = 1
  AND a.effective_start_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
  AND (a.effective_end_date IS NULL OR a.effective_end_date >= DATE_ADD(CURDATE(), INTERVAL 1 DAY))
GROUP BY a.student_id, a.shift_type
HAVING COUNT(*) > 1;

-- 5. Sample data: assignments với điểm dừng cụ thể
SELECT 'SAMPLE: ASSIGNMENTS VỚI ĐIỂM DỪNG' as test_section;

SELECT 
  s.name as student_name,
  r.route_name,
  a.shift_type,
  COALESCE(ps.name, 'Không xác định') as pickup_stop,
  COALESCE(ds.name, 'Không xác định') as dropoff_stop,
  a.effective_start_date,
  a.effective_end_date
FROM student_route_assignments a
JOIN students s ON a.student_id = s.id
JOIN routes r ON a.route_id = r.id
LEFT JOIN stops ps ON a.pickup_stop_id = ps.id
LEFT JOIN stops ds ON a.dropoff_stop_id = ds.id
WHERE a.active = 1
ORDER BY r.route_name, a.shift_type, s.name
LIMIT 10;