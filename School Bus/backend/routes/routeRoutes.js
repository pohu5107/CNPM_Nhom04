// /backend/routes/routeRoutes.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM routes');
        res.status(200).json({ 
            success: true, 
            data: rows,
            message: 'Lấy danh sách tuyến đường thành công'
        });
    } catch (error) {
        console.error('Lỗi khi lấy tuyến đường:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params; 
        const [rows] = await pool.query('SELECT * FROM routes WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tuyến đường' });
        }
        
        res.status(200).json({ 
            success: true, 
            data: rows[0],
            message: 'Lấy thông tin tuyến đường thành công'
        }); 
    } catch (error) {
        console.error('Lỗi khi lấy 1 tuyến đường:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

// -- Thêm MỚI ---
router.post('/', async (req, res) => {
    try {
        // Lấy dữ liệu JSON từ 'body' của request
        const { name,distance, status } = req.body;

        if (!name || !distance || !status ){
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin' });
        }

        // Thêm các trường mặc định để phù hợp với frontend
        const query = `INSERT INTO routes (name, distance, status, created_at) 
                       VALUES (?, ?, ?, NOW())`;
        const [result] = await pool.query(query, [name, distance, status]);

        const [newRoute] = await pool.query('SELECT * FROM routes WHERE id = ?', [result.insertId]);
        
        res.status(201).json({ // 201 Created - mã chuẩn cho POST thành công
            success: true, 
            message: 'Tạo tuyến đường thành công', 
            data: newRoute[0] 
        });

    } catch (error) {
        console.error('Lỗi khi tạo tuyến đường:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

// sửa
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL
        const { name, distance, status } = req.body; // Lấy thông tin mới từ body

        if (!name || !distance || !status) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin' });
        }
        
        const query = `
            UPDATE routes 
            SET name = ?, distance = ?, status = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [name, distance, status, id]);

        if (result.affectedRows === 0) {
            // Nếu không có dòng nào bị ảnh hưởng -> không tìm thấy id
            return res.status(404).json({ success: false, message: 'Không tìm thấy tuyến đường để cập nhật' });
        }

        // Lấy lại thông tin tuyến đường vừa cập nhật
        const [updatedRoute] = await pool.query('SELECT * FROM routes WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Cập nhật tuyến đường thành công',
            data: updatedRoute[0]
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật tuyến đường:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

// xóa
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL

        const [result] = await pool.query('DELETE FROM routes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tuyến đường để xóa' });
        }

        res.status(200).json({ // 200 OK
            success: true,
            message: 'Xóa tuyến đường thành công'
        });

    } catch (error) {
        console.error('Lỗi khi xóa tuyến đường:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

export default router;