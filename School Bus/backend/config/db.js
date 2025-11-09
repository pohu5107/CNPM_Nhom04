// /backend/config/db.js

// 1. Import thư viện (ES6 modules)
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import process from 'process';
// Tải các biến từ tệp .env
dotenv.config();

// 2. Tạo Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',       // Lấy từ tệp .env
    user: process.env.DB_USER || 'root',             // Lấy từ tệp .env
    password: process.env.DB_PASSWORD || '',         // Lấy từ tệp .env
    database: process.env.DB_NAME || 'school_bus_db',    // Lấy từ tệp .env
    port: process.env.DB_PORT || 3306,               // Lấy từ tệp .env
    waitForConnections: true,                        // Chờ nếu hết kết nối
    connectionLimit: 10,                             // Số kết nối tối đa
    queueLimit: 0                                    // Hàng đợi (0 = không giới hạn)
});

// 3. (Tùy chọn) Hàm kiểm tra kết nối nhanh
async function checkConnection() {
    try {
        const connection = await pool.getConnection(); // Mượn 1 kết nối
        console.log(" Kết nối CSDL MySQL thành công!");
        connection.release(); // Trả kết nối về pool
    } catch (err) {
        console.error(" Kết nối CSDL MySQL thất bại:", err.message);
    }
}

// 4. Chạy hàm kiểm tra khi khởi động
checkConnection();

// 5. Xuất (export) pool để các tệp khác có thể dùng
export default pool;