// /backend/routes/driversRoutes.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/drivers - Lấy danh sách tất cả tài xế
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                d.*,
                u.email,
                u.username
            FROM drivers d
            LEFT JOIN users u ON d.user_id = u.id
            ORDER BY d.id DESC
        `);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách tài xế',
            error: error.message
        });
    }
});

// GET /api/drivers/:id - Lấy thông tin một tài xế
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT 
                d.*,
                u.email,
                u.username
            FROM drivers d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài xế'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin tài xế',
            error: error.message
        });
    }
});

// POST /api/drivers - Thêm tài xế mới
router.post('/', async (req, res) => {
    try {
        const { name, phone, license_number, address, status = 'active' } = req.body;
        
        // Validate required fields
        if (!name || !phone || !license_number) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: tên, số điện thoại, số bằng lái'
            });
        }
        
        // Check if license_number already exists
        const [existing] = await pool.execute(
            'SELECT id FROM drivers WHERE license_number = ?',
            [license_number]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số bằng lái đã tồn tại'
            });
        }
        
        // Tạo username từ license_number (đảm bảo unique)
        const username = `driver_${license_number}`;
        const email = `${username}@schoolbus.com`;
        const defaultPassword = license_number; // Sử dụng số bằng lái làm mật khẩu mặc định
        
        // Tạo user account trước
        let user_id = null;
        try {
            const [userResult] = await pool.execute(`
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, 'driver')
            `, [username, email, defaultPassword]);
            
            user_id = userResult.insertId;
        } catch (userError) {
            // Nếu username đã tồn tại, kiểm tra xem có phải user của driver khác không
            if (userError.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Tài khoản với số bằng lái này đã tồn tại'
                });
            }
            throw userError;
        }
        
        const [result] = await pool.execute(`
            INSERT INTO drivers (name, phone, license_number, address, status, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [name, phone, license_number, address || null, status, user_id]);
        
        // Get the created driver
        const [newDriver] = await pool.execute(`
            SELECT 
                d.*,
                u.email,
                u.username
            FROM drivers d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Thêm tài xế thành công',
            data: newDriver[0]
        });
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm tài xế',
            error: error.message
        });
    }
});

// PUT /api/drivers/:id - Cập nhật thông tin tài xế
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, license_number, address, status } = req.body;
        
        // Check if driver exists và lấy thông tin user_id hiện tại
        const [existing] = await pool.execute(
            'SELECT id, user_id, license_number FROM drivers WHERE id = ?', 
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài xế'
            });
        }
        
        const currentDriver = existing[0];
        
        // Check if license_number already exists for other drivers
        const [licenseExists] = await pool.execute(
            'SELECT id FROM drivers WHERE license_number = ? AND id != ?',
            [license_number, id]
        );
        
        if (licenseExists.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số bằng lái đã tồn tại'
            });
        }
        
        // Nếu driver chưa có user_id, tạo mới
        let user_id = currentDriver.user_id;
        
        if (!user_id) {
            const username = `driver_${license_number}`;
            const email = `${username}@schoolbus.com`;
            const defaultPassword = license_number;
            
            try {
                const [userResult] = await pool.execute(`
                    INSERT INTO users (username, email, password, role)
                    VALUES (?, ?, ?, 'driver')
                `, [username, email, defaultPassword]);
                
                user_id = userResult.insertId;
            } catch (userError) {
                if (userError.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        success: false,
                        message: 'Tài khoản với số bằng lái này đã tồn tại'
                    });
                }
                throw userError;
            }
        } else if (license_number !== currentDriver.license_number) {
            // Nếu số bằng lái thay đổi, cập nhật username và email
            const newUsername = `driver_${license_number}`;
            const newEmail = `${newUsername}@schoolbus.com`;
            
            await pool.execute(`
                UPDATE users 
                SET username = ?, email = ?, password = ?
                WHERE id = ?
            `, [newUsername, newEmail, license_number, user_id]);
        }
        
        await pool.execute(`
            UPDATE drivers 
            SET name = ?, phone = ?, license_number = ?, address = ?, status = ?, user_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, phone, license_number, address || null, status, user_id, id]);
        
        // Get updated driver
        const [updatedDriver] = await pool.execute(`
            SELECT 
                d.*,
                u.email,
                u.username
            FROM drivers d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        `, [id]);
        
        res.json({
            success: true,
            message: 'Cập nhật tài xế thành công',
            data: updatedDriver[0]
        });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật tài xế',
            error: error.message
        });
    }
});

// DELETE /api/drivers/:id - Xóa tài xế
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if driver exists and get user_id
        const [existing] = await pool.execute(
            'SELECT id, user_id FROM drivers WHERE id = ?', 
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài xế'
            });
        }
        
        const driver = existing[0];
        
        // Xóa driver trước
        await pool.execute('DELETE FROM drivers WHERE id = ?', [id]);
        
        // Nếu driver có user_id, xóa luôn user account tương ứng
        if (driver.user_id) {
            await pool.execute('DELETE FROM users WHERE id = ?', [driver.user_id]);
        }
        
        res.json({
            success: true,
            message: 'Xóa tài xế thành công'
        });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa tài xế',
            error: error.message
        });
    }
});

// GET /api/drivers/:id/details - Lấy thông tin chi tiết của tài xế
router.get('/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Thông tin cơ bản của tài xế
        const [driverRows] = await pool.execute(`
            SELECT 
                d.*,
                u.email,
                u.username
            FROM drivers d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        `, [id]);
        
        if (driverRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài xế'
            });
        }
        
        const driver = driverRows[0];
        
        // Lấy lịch trình làm việc theo thời gian
        const [scheduleRows] = await pool.execute(`
            SELECT 
                s.id,
                s.date,
                s.shift_type,
                s.shift_number,
                s.start_time,
                s.end_time,
                s.start_point,
                s.end_point,
                r.route_name,
                r.distance,
                b.bus_number,
                b.license_plate,
                b.status as bus_status
            FROM schedules s
            JOIN routes r ON s.route_id = r.id
            JOIN buses b ON s.bus_id = b.id
            WHERE s.driver_id = ?
            ORDER BY s.date DESC, s.start_time ASC
        `, [id]);
        
        res.json({
            success: true,
            data: {
                ...driver,
                schedules: scheduleRows
            }
        });
    } catch (error) {
        console.error('Error fetching driver details:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin chi tiết tài xế',
            error: error.message
        });
    }
});

export default router;