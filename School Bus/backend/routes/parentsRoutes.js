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
                p.id,
                p.name,
                COALESCE(u.email, 'Chưa có') as email,
                p.phone,
                p.address,
                p.relationship,
                'active' as status,
                p.user_id
            FROM parents p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
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

// GET /api/parents/:id/children - Lấy danh sách con của phụ huynh (cập nhật cho morning/afternoon routes)
router.get('/:id/children', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [children] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.grade,
                s.class,
                c.class_name,
                c.homeroom_teacher,
                s.address,
                s.phone as student_phone,
                s.status,
                -- Morning route info
                s.morning_route_id,
                mr.route_name as morning_route_name,
                s.morning_pickup_stop_id,
                mps.name as morning_pickup_stop_name,
                -- Afternoon route info  
                s.afternoon_route_id,
                ar.route_name as afternoon_route_name,
                s.afternoon_dropoff_stop_id,
                ads.name as afternoon_dropoff_stop_name,
                -- Morning schedule info
                ms.bus_id as morning_bus_id,
                mb.bus_number as morning_bus_number,
                mb.license_plate as morning_license_plate,
                ms.scheduled_start_time as morning_start_time,
                ms.scheduled_end_time as morning_end_time,
                -- Afternoon schedule info
                as_table.bus_id as afternoon_bus_id,
                ab.bus_number as afternoon_bus_number,
                ab.license_plate as afternoon_license_plate,
                as_table.scheduled_start_time as afternoon_start_time,
                as_table.scheduled_end_time as afternoon_end_time
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN routes mr ON s.morning_route_id = mr.id
            LEFT JOIN routes ar ON s.afternoon_route_id = ar.id
            LEFT JOIN stops mps ON s.morning_pickup_stop_id = mps.id
            LEFT JOIN stops ads ON s.afternoon_dropoff_stop_id = ads.id
            -- Morning schedule info (latest)
            LEFT JOIN schedules ms ON s.morning_route_id = ms.route_id 
                AND ms.shift_type = 'morning' 
                AND ms.date = (
                    SELECT MAX(date) FROM schedules 
                    WHERE route_id = s.morning_route_id AND shift_type = 'morning'
                        AND status IN ('scheduled', 'in_progress', 'completed')
                )
            LEFT JOIN buses mb ON ms.bus_id = mb.id
            -- Afternoon schedule info (latest)
            LEFT JOIN schedules as_table ON s.afternoon_route_id = as_table.route_id 
                AND as_table.shift_type = 'afternoon' 
                AND as_table.date = (
                    SELECT MAX(date) FROM schedules 
                    WHERE route_id = s.afternoon_route_id AND shift_type = 'afternoon'
                        AND status IN ('scheduled', 'in_progress', 'completed')
                )
            LEFT JOIN buses ab ON as_table.bus_id = ab.id
            WHERE s.parent_id = ? AND s.status = 'active'
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
        const { name, email, phone, address, relationship } = req.body;

        // Validate required fields
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: tên và số điện thoại'
            });
        }

        // Check if phone already exists
        const [existingPhone] = await pool.execute(
            'SELECT id FROM parents WHERE phone = ?',
            [phone]
        );

        if (existingPhone.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã tồn tại'
            });
        }

        let user_id = null;
        
        // Nếu có email, tạo user account và lấy user_id
        if (email && email !== '') {
            // Check if email already exists
            const [existingEmail] = await pool.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingEmail.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã tồn tại'
                });
            }

            // Tạo user account mới (mật khẩu mặc định sẽ được hash)
            const defaultPassword = '123456'; // Mật khẩu mặc định
            const [userResult] = await pool.execute(`
                INSERT INTO users (email, password, role, status) 
                VALUES (?, ?, 'parent', 'active')
            `, [email, defaultPassword]); // Trong thực tế cần hash password
            
            user_id = userResult.insertId;
        }

        const [result] = await pool.execute(`
            INSERT INTO parents (name, phone, address, relationship, user_id) 
            VALUES (?, ?, ?, ?, ?)
        `, [name, phone, address || null, relationship || 'Phụ huynh', user_id]);

        // Get the newly created parent
        const [newParent] = await pool.execute(`
            SELECT 
                p.id,
                p.name,
                COALESCE(u.email, 'Chưa có') as email,
                p.phone,
                p.address,
                p.relationship,
                'active' as status
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
        const { name, email, phone, address, relationship } = req.body;

        // Check if parent exists
        const [existing] = await pool.execute('SELECT id, user_id FROM parents WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ huynh'
            });
        }

        // Check if phone already exists (except current parent)
        const [existingPhone] = await pool.execute(
            'SELECT id FROM parents WHERE phone = ? AND id != ?',
            [phone, id]
        );

        if (existingPhone.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã tồn tại'
            });
        }

        let user_id = existing[0].user_id;

        // Xử lý email và user account
        if (email && email !== '' && email !== 'Chưa có') {
            if (user_id) {
                // Update existing user email
                const [existingEmail] = await pool.execute(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [email, user_id]
                );

                if (existingEmail.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã tồn tại'
                    });
                }

                await pool.execute('UPDATE users SET email = ? WHERE id = ?', [email, user_id]);
            } else {
                // Create new user account
                const [existingEmail] = await pool.execute(
                    'SELECT id FROM users WHERE email = ?',
                    [email]
                );

                if (existingEmail.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã tồn tại'
                    });
                }

                const defaultPassword = '123456';
                const [userResult] = await pool.execute(`
                    INSERT INTO users (email, password, role, status) 
                    VALUES (?, ?, 'parent', 'active')
                `, [email, defaultPassword]);
                
                user_id = userResult.insertId;
            }
        } else if ((!email || email === '' || email === 'Chưa có') && user_id) {
            // Remove user account if email is cleared
            await pool.execute('DELETE FROM users WHERE id = ?', [user_id]);
            user_id = null;
        }

        await pool.execute(`
            UPDATE parents 
            SET name = ?, phone = ?, address = ?, relationship = ?, user_id = ?
            WHERE id = ?
        `, [name, phone, address || null, relationship || 'Phụ huynh', user_id, id]);

        // Get updated parent
        const [updatedParent] = await pool.execute(`
            SELECT 
                p.id,
                p.name,
                COALESCE(u.email, 'Chưa có') as email,
                p.phone,
                p.address,
                p.relationship,
                'active' as status
            FROM parents p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
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
        const [existing] = await pool.execute('SELECT id, user_id FROM parents WHERE id = ?', [id]);
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
                message: 'Không thể xóa phụ huynh vì còn có con đang học'
            });
        }

        // Delete parent
        await pool.execute('DELETE FROM parents WHERE id = ?', [id]);

        // Delete associated user account if exists
        if (existing[0].user_id) {
            await pool.execute('DELETE FROM users WHERE id = ?', [existing[0].user_id]);
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