// /backend/server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import process from 'process';
import pool from './config/db.js';
import busRoutes from './routes/BusesRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import studentsRoutes from './routes/studentsRoutes.js';
import driversRoutes from './routes/driversRoutes.js';
import parentsRoutes from './routes/parentsRoutes.js';
import classesRoutes from './routes/classesRoutes.js';
import schedulesRoutes from './routes/schedulesRoutes.js';
import userRoutes  from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Thêm dòng này
import adminschedulesRoutes from './routes/adminschedulesRoutes.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
    
    ]
}));

// API Routes
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/parents', parentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/admin-schedules', adminschedulesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); // Thêm dòng này
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
app.listen(PORT, () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🚌 Bus API: http://localhost:${PORT}/api/buses`);
    console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});