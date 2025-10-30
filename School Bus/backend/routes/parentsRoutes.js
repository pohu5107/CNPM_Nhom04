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
                -- Get current bus assignment and schedule info
                sch_template.bus_id,
                b.bus_number,
                b.license_plate,
                sch_template.date as schedule_date,
                sch_template.start_time as schedule_start_time,
                sch_template.end_time as schedule_end_time,
                sch_template.start_point as schedule_start_point,
                sch_template.end_point as schedule_end_point
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN (
                SELECT DISTINCT 
                    route_id,
                    bus_id,
                    start_time,
                    end_time,
                    start_point,
                    end_point,
                    date,
                    ROW_NUMBER() OVER (PARTITION BY route_id ORDER BY 
                        CASE WHEN bus_id = 1 THEN 1 ELSE 2 END,
                        date DESC) as rn
                FROM schedules 
                WHERE status IN ('scheduled', 'in_progress', 'completed')
            ) sch_template ON sch_template.route_id = s.route_id 
                AND sch_template.rn = 1
            LEFT JOIN buses b ON sch_template.bus_id = b.id
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
        
        // Tạo user account trước nếu có email
        let user_id = null;
        if (email) {
            // Check if email already exists in users table
            const [emailExists] = await pool.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            
            if (emailExists.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã tồn tại'
                });
            }
            
            // Tạo username từ phone number
            const username = `parent_${phone}`;
            const defaultPassword = phone; // Sử dụng số điện thoại làm mật khẩu mặc định
            
            try {
                const [userResult] = await pool.execute(`
                    INSERT INTO users (username, email, password, role)
                    VALUES (?, ?, ?, 'parent')
                `, [username, email, defaultPassword]);
                
                user_id = userResult.insertId;
            } catch (userError) {
                if (userError.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        success: false,
                        message: 'Tài khoản với số điện thoại này đã tồn tại'
                    });
                }
                throw userError;
            }
        }
        
        const [result] = await pool.execute(`
            INSERT INTO parents (user_id, name, phone, relationship, address)
            VALUES (?, ?, ?, ?, ?)
        `, [user_id, name, phone, relationship || null, address || null]);
        
        // Get the created parent
        const [newParent] = await pool.execute(`
            SELECT 
                p.id,
                p.user_id,
                p.name,
                u.email,
                p.phone,
                p.relationship,
                p.address,
                'active' as status,
                0 as children_count
            FROM parents p
            LEFT JOIN users u ON p.user_id = u.id
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
        
        // Check if parent exists and get user_id
        const [existing] = await pool.execute(
            'SELECT id, user_id FROM parents WHERE id = ?', 
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ huynh'
            });
        }
        
        const currentParent = existing[0];
        
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
        
        // Handle user account logic
        let user_id = currentParent.user_id;
        
        if (email) {
            // Check if email already exists for other users
            const [emailExists] = await pool.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, user_id || 0]
            );
            
            if (emailExists.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã tồn tại'
                });
            }
            
            if (!user_id) {
                // Tạo user account mới nếu chưa có
                const username = `parent_${phone}`;
                const defaultPassword = phone;
                
                try {
                    const [userResult] = await pool.execute(`
                        INSERT INTO users (username, email, password, role)
                        VALUES (?, ?, ?, 'parent')
                    `, [username, email, defaultPassword]);
                    
                    user_id = userResult.insertId;
                } catch (userError) {
                    if (userError.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            success: false,
                            message: 'Tài khoản với số điện thoại này đã tồn tại'
                        });
                    }
                    throw userError;
                }
            } else {
                // Cập nhật user account hiện tại
                const newUsername = `parent_${phone}`;
                await pool.execute(`
                    UPDATE users 
                    SET username = ?, email = ?, password = ?
                    WHERE id = ?
                `, [newUsername, email, phone, user_id]);
            }
        } else if (user_id) {
            // Nếu xóa email, xóa luôn user account
            await pool.execute('DELETE FROM users WHERE id = ?', [user_id]);
            user_id = null;
        }
        
        await pool.execute(`
            UPDATE parents 
            SET user_id = ?, name = ?, phone = ?, relationship = ?, address = ?
            WHERE id = ?
        `, [user_id, name, phone, relationship || null, address || null, id]);
        
        // Get updated parent
        const [updatedParent] = await pool.execute(`
            SELECT 
                p.id,
                p.user_id,
                p.name,
                COALESCE(u.email, 'Chưa có') as email,
                p.phone,
                p.relationship,
                p.address,
                'active' as status,
                COUNT(s.id) as children_count
            FROM parents p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN students s ON p.id = s.parent_id
            WHERE p.id = ?
            GROUP BY p.id, p.user_id, p.name, u.email, p.phone, p.relationship, p.address
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
        
        // Check if parent exists and get user_id
        const [existing] = await pool.execute(
            'SELECT id, user_id FROM parents WHERE id = ?', 
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ huynh'
            });
        }
        
        const parent = existing[0];
        
        // Check if parent has children
        const [children] = await pool.execute('SELECT id FROM students WHERE parent_id = ?', [id]);
        if (children.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa phụ huynh vì còn ${children.length} học sinh liên kết`
            });
        }
        
        // Xóa parent trước
        await pool.execute('DELETE FROM parents WHERE id = ?', [id]);
        
        // Nếu có user_id, xóa luôn user account
        if (parent.user_id) {
            await pool.execute('DELETE FROM users WHERE id = ?', [parent.user_id]);
        }
        
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