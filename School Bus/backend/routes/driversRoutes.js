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
        
        const [result] = await pool.execute(`
            INSERT INTO drivers (name, phone, license_number, address, status)
            VALUES (?, ?, ?, ?, ?)
        `, [name, phone, license_number, address || null, status]);
        
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
        
        // Check if driver exists
        const [existing] = await pool.execute('SELECT id FROM drivers WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài xế'
            });
        }
        
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
        
        await pool.execute(`
            UPDATE drivers 
            SET name = ?, phone = ?, license_number = ?, address = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, phone, license_number, address || null, status, id]);
        
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
        
        // Check if driver exists
        const [existing] = await pool.execute('SELECT id FROM drivers WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài xế'
            });
        }
        
        await pool.execute('DELETE FROM drivers WHERE id = ?', [id]);
        
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

export default router;