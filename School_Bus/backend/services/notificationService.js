// School Bus/backend/services/notificationService.js

// Hàm giả lập để lấy vị trí xe buýt
const getBusLocation = async (routeId) => {
    // TODO: Thay thế bằng logic lấy vị trí xe buýt thực tế từ DB hoặc GPS
    return { lat: Math.random() * 90, lng: Math.random() * 180 };
};

// Hàm giả lập để lấy thông tin điểm dừng của học sinh
const getStudentStop = async (parentId) => {
    // TODO: Lấy thông tin điểm dừng của con cái phụ huynh từ DB
    return { lat: Math.random() * 90, lng: Math.random() * 180, routeId: 'route123' };
};

// Hàm tính khoảng cách (ví dụ đơn giản)
const calculateDistance = (loc1, loc2) => {
    // Logic tính khoảng cách thực tế nên dùng thư viện như haversine-distance
    const dx = loc1.lat - loc2.lat;
    const dy = loc1.lng - loc2.lng;
    return Math.sqrt(dx * dx + dy * dy);
};

const checkBusStatus = async (io) => {
    console.log('Checking bus statuses...');
    // Lấy danh sách tất cả các tuyến xe đang hoạt động
    const activeRoutes = ['route123', 'route456']; // TODO: Lấy từ DB

    for (const routeId of activeRoutes) {
        const busLocation = await getBusLocation(routeId);

        // Lấy danh sách phụ huynh trên tuyến đường này
        const parentsOnRoute = [{ id: 'parent1', stop: { lat: 10.8, lng: 106.7 } }]; // TODO: Lấy từ DB

        for (const parent of parentsOnRoute) {
            const distance = calculateDistance(busLocation, parent.stop);

            // 1. Gửi thông báo khi xe đến gần
            if (distance < 0.5) { // Giả sử ngưỡng là 0.5 km
                console.log(`Bus for route ${routeId} is approaching parent ${parent.id}`);
                io.to(routeId).emit('bus_approaching', {
                    message: `Xe buýt sắp đến điểm dừng của bạn trong vài phút nữa.`,
                    parentId: parent.id,
                });
            }
        }

        // 2. Gửi cảnh báo khi xe bị trễ
        // TODO: Thêm logic kiểm tra thời gian dự kiến và thời gian thực tế
        const isDelayed = false; // Giả sử kiểm tra và thấy xe bị trễ
        if (isDelayed) {
            console.log(`Bus for route ${routeId} is delayed.`);
            io.to(routeId).emit('bus_delayed', {
                message: `Cảnh báo: Xe buýt tuyến của bạn đã bị trễ.`,
                routeId: routeId,
            });
        }
    }
};

// Chạy kiểm tra định kỳ mỗi 30 giây
const startBusStatusChecks = (io) => {
    setInterval(() => checkBusStatus(io), 30000);
};

export default { startBusStatusChecks };
