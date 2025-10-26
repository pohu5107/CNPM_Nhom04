// backend/controllers/authController.js
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập tên người dùng và mật khẩu.' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Tên người dùng không tồn tại.' });
        }

        const user = rows[0];

        // So sánh mật khẩu (không mã hóa)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Mật khẩu không đúng.' });
        }

        // Tạo JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key', // Nên đặt secret key trong file .env
            { expiresIn: '1d' } // Token hết hạn sau 1 ngày
        );

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: token,
        });

    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
};

export { loginUser };
