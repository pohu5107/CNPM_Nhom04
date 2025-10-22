// /backend/routes/parentsRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/parents - Lấy danh sách tất cả phụ huynh
router.get('/', async (req, res) => {
    try {
        // Query trực tiếp với JOIN để lấy email từ bảng users
        const [rows] = await pool.execute(`
            SELECT 
                p.id,
                p.name,
                COALESCE(u.email, 'Chưa có') as email,
                p.phone,
                p.address,
                p.relationship,
                'active' as status,
                COUNT(s.id) as children_count,
                GROUP_CONCAT(s.name SEPARATOR ', ') as children_names
            FROM parents p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN students s ON p.id = s.parent_id
            GROUP BY p.id, p.name, u.email, p.phone, p.address, p.relationship
            ORDER BY p.id DESC
        `);
        
        console.log('✅ Parents with emails from JOIN:', rows);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Error fetching parents:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách phụ huynh',
            error: error.message
        });
    }
});

// GET /api/parents/:id - Lấy thông tin một phụ huynh
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT 
                p.*,
                u.email,
                u.username,
                COUNT(s.id) as children_count
            FROM parents p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN students s ON p.id = s.parent_id
            WHERE p.id = ?
            GROUP BY p.id
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ huynh'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching parent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin phụ huynh',
            error: error.message
        });
    }
});

// GET /api/parents/:id/children - Lấy danh sách con của phụ huynh
router.get('/:id/children', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if parent exists
        const [parentExists] = await pool.execute('SELECT id FROM parents WHERE id = ?', [id]);
        if (parentExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ huynh'
            });
        }
        
        const [children] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class_id,
                c.class_name as class,
                s.address,
                s.phone,
                s.parent_id,
                s.status,
                r.route_name,
                b.bus_number,
                b.license_plate
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN buses b ON s.bus_id = b.id
            WHERE s.parent_id = ?
            ORDER BY s.name ASC
        `, [id]);
        
        res.json({
            success: true,
            data: children,
            count: children.length
        });
    } catch (error) {
        console.error('Error fetching parent children:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách con',
            error: error.message
        });
    }
});

// POST /api/parents - Thêm phụ huynh mới
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, relationship, address, status = 'active' } = req.body;
        
        // Validate required fields
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: tên và số điện thoại'
            });
        }
        
        // Check if phone already exists
        const [phoneExists] = await pool.execute(
            'SELECT id FROM parents WHERE phone = ?',
            [phone]
        );
        
        if (phoneExists.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã tồn tại'
            });
        }
        
        // Check if email already exists
        if (email) {
            const [emailExists] = await pool.execute(
                'SELECT id FROM parents WHERE email = ?',
                [email]
            );
            
            if (emailExists.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã tồn tại'
                });
            }
        }
        
        const [result] = await pool.execute(`
            INSERT INTO parents (name, email, phone, relationship, address, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [name, email || null, phone, relationship || null, address || null, status]);
        
        // Get the created parent
        const [newParent] = await pool.execute(`
            SELECT 
                p.id,
                p.name,
                p.email,
                p.phone,
                p.relationship,
                p.address,
                p.status,
                0 as children_count
            FROM parents p
            WHERE p.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Thêm phụ huynh thành công',
            data: newParent[0]
        });
    } catch (error) {
        console.error('Error creating parent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm phụ huynh',
            error: error.message
        });
    }
});

// PUT /api/parents/:id - Cập nhật thông tin phụ huynh
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, relationship, address, status } = req.body;
        
        // Check if parent exists
        const [existing] = await pool.execute('SELECT id FROM parents WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ huynh'
            });
        }
        
        // Check if phone already exists for other parents
        const [phoneExists] = await pool.execute(
            'SELECT id FROM parents WHERE phone = ? AND id != ?',
            [phone, id]
        );
        
        if (phoneExists.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã tồn tại'
            });
        }
        
        // Check if email already exists for other parents
        if (email) {
            const [emailExists] = await pool.execute(
                'SELECT id FROM parents WHERE email = ? AND id != ?',
                [email, id]
            );
            
            if (emailExists.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã tồn tại'
                });
            }
        }
        
        await pool.execute(`
            UPDATE parents 
            SET name = ?, email = ?, phone = ?, relationship = ?, address = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, email || null, phone, relationship || null, address || null, status || 'active', id]);
        
        // Get updated parent
        const [updatedParent] = await pool.execute(`
            SELECT 
                p.id,
                p.name,
                p.email,
                p.phone,
                p.relationship,
                p.address,
                p.status,
                COUNT(s.id) as children_count
            FROM parents p
            LEFT JOIN students s ON p.id = s.parent_id
            WHERE p.id = ?
            GROUP BY p.id, p.name, p.email, p.phone, p.relationship, p.address, p.status
        `, [id]);
        
        res.json({
            success: true,
            message: 'Cập nhật phụ huynh thành công',
            data: updatedParent[0]
        });
    } catch (error) {
        console.error('Error updating parent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật phụ huynh',
            error: error.message
        });
    }
});

// DELETE /api/parents/:id - Xóa phụ huynh
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if parent exists
        const [existing] = await pool.execute('SELECT id FROM parents WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ huynh'
            });
        }
        
        // Check if parent has children
        const [children] = await pool.execute('SELECT id FROM students WHERE parent_id = ?', [id]);
        if (children.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa phụ huynh vì còn ${children.length} học sinh liên kết`
            });
        }
        
        await pool.execute('DELETE FROM parents WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Xóa phụ huynh thành công'
        });
    } catch (error) {
        console.error('Error deleting parent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa phụ huynh',
            error: error.message
        });
    }
});

export default router;