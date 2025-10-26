// School Bus/src/services/socketService.js
import { io } from 'socket.io-client';

// URL của backend server
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
    autoConnect: true, // Tự động kết nối
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
});

export default socket;
