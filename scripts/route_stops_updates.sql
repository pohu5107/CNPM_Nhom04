-- route_stops updates: reorder stops to group nearby stops (nearest-neighbor)
-- PLEASE REVIEW before applying. Run inside your DB (e.g., via phpMyAdmin or mysql client).
-- route_stops updates: reorder stops to group nearby stops (nearest-neighbor)
-- Safe two-step update to avoid unique-key conflicts (route_id, stop_order)
-- Usage: run this as a single script. It wraps changes in a transaction and uses a large offset
-- to move current orders out of the way, then writes the desired final orders.

-- IMPORTANT: BACKUP your DB before running.

SET autocommit = 0;
START TRANSACTION;

-- Step 1: move current stop_order values out of collision range for affected routes
-- (choose an offset large enough; here 10000)
UPDATE route_stops
SET stop_order = stop_order + 10000
WHERE route_id IN (1,2,3,4,5,6);

-- Step 2: set the new desired orders (per-route). These won't conflict because previous
-- values are all >10000 now.

-- Route 1 (Tuyến Quận 1 - Sáng)
UPDATE route_stops SET stop_order = 0 WHERE id = 133; -- stop_id 44
UPDATE route_stops SET stop_order = 1 WHERE id = 135; -- stop_id 48
UPDATE route_stops SET stop_order = 2 WHERE id = 136; -- stop_id 45
UPDATE route_stops SET stop_order = 3 WHERE id = 134; -- stop_id 1
UPDATE route_stops SET stop_order = 4 WHERE id = 137; -- stop_id 43

-- Route 2 (Tuyến Gò Vấp - Sáng)
UPDATE route_stops SET stop_order = 0 WHERE id = 138; -- stop_id 49
UPDATE route_stops SET stop_order = 1 WHERE id = 140; -- stop_id 51
UPDATE route_stops SET stop_order = 2 WHERE id = 139; -- stop_id 50
UPDATE route_stops SET stop_order = 3 WHERE id = 141; -- stop_id 43 (terminal)

-- Route 3 (Tuyến Thủ Đức - Chiều)
UPDATE route_stops SET stop_order = 0 WHERE id = 143; -- stop_id 57
UPDATE route_stops SET stop_order = 1 WHERE id = 145; -- stop_id 55
UPDATE route_stops SET stop_order = 2 WHERE id = 146; -- stop_id 54
UPDATE route_stops SET stop_order = 3 WHERE id = 144; -- stop_id 56
UPDATE route_stops SET stop_order = 4 WHERE id = 142; -- stop_id 43 (moved to end)

-- Route 4 (Tuyến Gò Vấp - Chiều)
UPDATE route_stops SET stop_order = 0 WHERE id = 148; -- stop_id 51
UPDATE route_stops SET stop_order = 1 WHERE id = 149; -- stop_id 50
UPDATE route_stops SET stop_order = 2 WHERE id = 150; -- stop_id 49 (terminal)
UPDATE route_stops SET stop_order = 3 WHERE id = 147; -- stop_id 43 (moved to end)

-- Route 5 (Tuyến Quận 1 - Chiều)
UPDATE route_stops SET stop_order = 0 WHERE id = 151; -- stop_id 43
UPDATE route_stops SET stop_order = 1 WHERE id = 153; -- stop_id 48
UPDATE route_stops SET stop_order = 2 WHERE id = 154; -- stop_id 1
UPDATE route_stops SET stop_order = 3 WHERE id = 152; -- stop_id 2
UPDATE route_stops SET stop_order = 4 WHERE id = 155; -- stop_id 44 (terminal)

-- Route 6 (Tuyến Thủ Đức - Sáng)
UPDATE route_stops SET stop_order = 0 WHERE id = 156; -- stop_id 54
UPDATE route_stops SET stop_order = 1 WHERE id = 157; -- stop_id 55
UPDATE route_stops SET stop_order = 2 WHERE id = 159; -- stop_id 57
UPDATE route_stops SET stop_order = 3 WHERE id = 158; -- stop_id 52
UPDATE route_stops SET stop_order = 4 WHERE id = 160; -- stop_id 43 (terminal)

-- Optional sanity check: ensure no stop_order >= 10000 remain (if so, rollback and inspect)
-- SELECT COUNT(*) FROM route_stops WHERE stop_order >= 10000 AND route_id IN (1,2,3,4,5,6);

COMMIT;

SET autocommit = 1;

-- End of updates
