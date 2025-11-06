// /backend/routes/studentAssignmentsRoutes.js
// Student-to-route assignment module (Option B: normalized assignments with effectivity and shift)

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Ensure table exists at module load
async function ensureTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS student_route_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      route_id INT NOT NULL,
      pickup_stop_id INT NULL,
      dropoff_stop_id INT NULL,
      effective_start_date DATE NOT NULL,
      effective_end_date DATE NULL,
      shift_type ENUM('morning','afternoon','evening') NOT NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_student_date (student_id, effective_start_date, effective_end_date),
      INDEX idx_route_date (route_id, effective_start_date, effective_end_date),
      INDEX idx_shift_date (shift_type, effective_start_date, effective_end_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  try {
    await pool.query(createTableSQL);
  } catch (err) {
    console.error('Failed to ensure student_route_assignments table:', err.message);
  }
}

ensureTable();

// Helpers
function withinDateRangeClause(dateFieldStart = 'effective_start_date', dateFieldEnd = 'effective_end_date') {
  // active on specific date: start <= date AND (end IS NULL OR end >= date)
  return `(${dateFieldStart} <= ? AND ( ${dateFieldEnd} IS NULL OR ${dateFieldEnd} >= ? ))`;
}

function mapAssignmentRow(row) {
  return {
    id: row.id,
    student_id: row.student_id,
    student_name: row.student_name,
    class_name: row.class_name || row.class,
    route_id: row.route_id,
    route_name: row.route_name,
    pickup_stop_id: row.pickup_stop_id,
    pickup_stop_name: row.pickup_stop_name,
    dropoff_stop_id: row.dropoff_stop_id,
    dropoff_stop_name: row.dropoff_stop_name,
    effective_start_date: row.effective_start_date,
    effective_end_date: row.effective_end_date,
    shift_type: row.shift_type,
    active: row.active === 1
  };
}

// GET /api/student-assignments?route_id=&date=&shift_type=
router.get('/', async (req, res) => {
  try {
    const { route_id, date, shift_type } = req.query;

    if (!route_id || !date || !shift_type) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số route_id, date hoặc shift_type' });
    }

    const [rows] = await pool.execute(
      `SELECT a.*, 
              s.name AS student_name, c.class_name, s.class,
              r.route_name,
              ps.name AS pickup_stop_name, ds.name AS dropoff_stop_name,
              DATE_FORMAT(a.effective_start_date, '%Y-%m-%d') as effective_start_date,
              DATE_FORMAT(a.effective_end_date, '%Y-%m-%d') as effective_end_date
       FROM student_route_assignments a
       JOIN students s ON a.student_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       JOIN routes r ON a.route_id = r.id
       LEFT JOIN stops ps ON a.pickup_stop_id = ps.id
       LEFT JOIN stops ds ON a.dropoff_stop_id = ds.id
       WHERE a.route_id = ?
         AND a.shift_type = ?
         AND a.active = 1
         AND ${withinDateRangeClause('a.effective_start_date','a.effective_end_date')}
       ORDER BY s.name ASC`,
      [route_id, shift_type, date, date]
    );

    res.json({ success: true, data: rows.map(mapAssignmentRow) });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách phân công', error: error.message });
  }
});

// GET /api/student-assignments/unassigned?date=&shift_type=&keyword=
// Returns students that are NOT assigned on the given date+shift to any route
// UPDATED: Bỏ qua students.route_id, chỉ dùng student_route_assignments
router.get('/unassigned', async (req, res) => {
  try {
    const { date, shift_type, keyword = '' } = req.query;
    if (!date || !shift_type) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số date hoặc shift_type' });
    }

    const kw = `%${keyword.trim()}%`;

    const [rows] = await pool.execute(
      `SELECT s.id, s.name, s.class, c.class_name,
              -- Hiển thị tuyến hiện tại (nếu có) cho reference
              current_route.route_name as current_route_name
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN (
         -- Tuyến hiện tại của học sinh (nếu có assignment active khác shift)
         SELECT sra.student_id, r.route_name
         FROM student_route_assignments sra
         JOIN routes r ON sra.route_id = r.id
         WHERE sra.active = 1
           AND sra.effective_start_date <= ?
           AND (sra.effective_end_date IS NULL OR sra.effective_end_date >= ?)
           AND sra.shift_type != ? -- Shift khác với shift đang query
         GROUP BY sra.student_id
       ) current_route ON s.id = current_route.student_id
       WHERE s.status = 'active'
         AND (s.name LIKE ? OR COALESCE(c.class_name, s.class, '') LIKE ?)
         AND NOT EXISTS (
            -- Kiểm tra CHƯA có assignment cho shift này trên date này
            SELECT 1 FROM student_route_assignments a
            WHERE a.student_id = s.id
              AND a.shift_type = ?
              AND a.active = 1
              AND ${withinDateRangeClause('a.effective_start_date','a.effective_end_date')}
         )
       ORDER BY s.name ASC`,
      [date, date, shift_type, kw, kw, shift_type, date, date]
    );

    const data = rows.map(r => ({ 
      id: r.id, 
      name: r.name, 
      class_name: r.class_name || r.class,
      current_route_info: r.current_route_name ? `(Đã có tuyến khác: ${r.current_route_name})` : null
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching unassigned students:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy học sinh chưa phân công', error: error.message });
  }
});

// GET /api/student-assignments/stops?route_id=123
router.get('/stops', async (req, res) => {
  try {
    const { route_id } = req.query;
    if (!route_id) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số route_id' });
    }

    const [rows] = await pool.execute(
      `SELECT rs.stop_order, st.id AS stop_id, st.name, st.address
       FROM route_stops rs
       JOIN stops st ON rs.stop_id = st.id
       WHERE rs.route_id = ?
       ORDER BY rs.stop_order ASC`,
      [route_id]
    );

    // Phân chia stops theo mục đích sử dụng
    const pickupStops = rows
      .filter(r => r.stop_order > 0 && r.stop_order < 99) // Chỉ các điểm dừng thật sự
      .map(r => ({
        stop_id: r.stop_id,
        stop_order: r.stop_order,
        name: r.name,
        label: `${r.name} (điểm ${r.stop_order})`
      }));

    const dropoffStop = rows
      .filter(r => r.stop_order === 99) // Chỉ điểm kết thúc
      .map(r => ({
        stop_id: r.stop_id,
        stop_order: r.stop_order,
        name: r.name,
        label: `${r.name} (điểm kết thúc)`
      }))[0]; // Chỉ có 1 điểm kết thúc

    res.json({ 
      success: true, 
      data: {
        pickup_stops: pickupStops,
        dropoff_stop: dropoffStop,
        all_stops: rows.map(r => ({
          stop_id: r.stop_id,
          stop_order: r.stop_order,
          name: r.name,
          type: r.stop_order === 0 ? 'start' : r.stop_order === 99 ? 'end' : 'pickup'
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching route stops:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy điểm dừng', error: error.message });
  }
});

// POST /api/student-assignments/bulk
// body: { route_id, shift_type, date, student_ids:[], pickup_stop_id?, dropoff_stop_id?, effective_end_date? }
router.post('/bulk', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { route_id, shift_type, date, student_ids = [], pickup_stop_id = null, dropoff_stop_id = null, effective_end_date = null } = req.body;

    if (!route_id || !shift_type || !date || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu bắt buộc' });
    }

    await conn.beginTransaction();

    // Optional: validate stops belong to route
    if (pickup_stop_id || dropoff_stop_id) {
      const ids = [pickup_stop_id, dropoff_stop_id].filter(Boolean);
      if (ids.length) {
        const [cntRows] = await conn.query(
          `SELECT COUNT(*) as cnt FROM route_stops WHERE route_id = ? AND stop_id IN (?)`,
          [route_id, ids]
        );
        if (cntRows[0].cnt !== ids.length) {
          throw new Error('Điểm dừng không thuộc tuyến đã chọn');
        }
      }
    }

    // Prevent duplicates: remove existing active overlapping assignments for these students on this shift/date
    await conn.query(
      `UPDATE student_route_assignments 
         SET active = 0
       WHERE student_id IN (?) AND shift_type = ? AND ${withinDateRangeClause('effective_start_date','effective_end_date')}`,
      [student_ids, shift_type, date, date]
    );

    const values = student_ids.map(id => [id, route_id, pickup_stop_id, dropoff_stop_id, date, effective_end_date, shift_type, 1]);
    await conn.query(
      `INSERT INTO student_route_assignments 
       (student_id, route_id, pickup_stop_id, dropoff_stop_id, effective_start_date, effective_end_date, shift_type, active)
       VALUES ?`,
      [values]
    );

    await conn.commit();
    res.status(201).json({ success: true, message: 'Phân công thành công' });
  } catch (error) {
    await conn.rollback();
    console.error('Error bulk assigning students:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi phân công học sinh', error: error.message });
  } finally {
    conn.release();
  }
});

// PUT /api/student-assignments/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pickup_stop_id = null, dropoff_stop_id = null, effective_start_date, effective_end_date = null, shift_type, active } = req.body;

    // Basic validation
    if (!effective_start_date || !shift_type) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu bắt buộc' });
    }

    await pool.execute(
      `UPDATE student_route_assignments 
         SET pickup_stop_id = ?, dropoff_stop_id = ?, effective_start_date = ?, effective_end_date = ?, shift_type = ?, active = COALESCE(?, active)
       WHERE id = ?`,
      [pickup_stop_id, dropoff_stop_id, effective_start_date, effective_end_date, shift_type, active, id]
    );

    res.json({ success: true, message: 'Cập nhật phân công thành công' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật phân công', error: error.message });
  }
});

// DELETE /api/student-assignments/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(`UPDATE student_route_assignments SET active = 0 WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Bỏ phân công thành công' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi bỏ phân công', error: error.message });
  }
});

export default router;
