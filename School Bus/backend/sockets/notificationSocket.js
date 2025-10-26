// School Bus/backend/sockets/notificationSocket.js
import notificationService from '../services/notificationService.js';

export function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Lắng nghe sự kiện đăng ký từ client (ví dụ: phụ huynh đã đăng ký nhận thông báo cho một tuyến xe)
        socket.on('registerForNotifications', (data) => {
            // data = { parentId: '...', routeId: '...' }
            console.log(`Parent ${data.parentId} registered for route ${data.routeId}`);
            // Tham gia một "room" theo routeId để dễ dàng gửi thông báo cho đúng phụ huynh
            socket.join(data.routeId);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    // Bắt đầu kiểm tra trạng thái xe buýt định kỳ
    notificationService.startBusStatusChecks(io);
}
