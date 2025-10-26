// /backend/server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import process from 'process';
import http from 'http'; // Thêm http
import { Server } from 'socket.io'; // Thêm socket.io
import pool from './config/db.js';
import busRoutes from './routes/BusesRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Import auth routes
import { initializeSocket } from './sockets/notificationSocket.js'; // Thêm socket initializer

const app = express();
const server = http.createServer(app); // Tạo http server
const io = new Server(server, { // Khởi tạo socket.io
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.BACKEND_PORT || 5000;

app.use(express.json()); //tạo ipa
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// Khởi tạo socket
initializeSocket(io);

// Routes
app.use('/api/auth', authRoutes); // Add auth routes
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
// check
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        const connection = await pool.getConnection();
        connection.release();
        
        res.json({
            success: true,
            message: 'Server and database are healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start server
server.listen(PORT, () => { // Sửa app.listen thành server.listen
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🚌 Bus API: http://localhost:${PORT}/api/buses`);
    console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});