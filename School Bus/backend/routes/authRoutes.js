import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; // Sử dụng pool kết nối từ db.js

const router = express.Router();

// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Kiểm tra đầu vào
    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    try {
        // 2. Tìm người dùng trong cơ sở dữ liệu
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Tên đăng nhập không tồn tại.' });
        }

        // 3. So sánh mật khẩu
        // **CẢNH BÁO BẢO MẬT**: So sánh mật khẩu dạng văn bản thô. Đây là một rủi ro bảo mật lớn.
        const isPasswordMatch = (password === user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
        }

        // 4. Tạo JWT Token
        // TUYỆT ĐỐI không để lộ 'YOUR_SECRET_KEY' trong code thực tế.
        // Hãy dùng biến môi trường (environment variable).
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'YOUR_SECRET_KEY',
            { expiresIn: '1h' } // Token hết hạn sau 1 giờ
        );

        // 5. Trả về token và thông tin người dùng cho frontend
        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra trên máy chủ.' });
    }
});

export default router;