import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    // Đọc trực tiếp từ sessionStorage để đảm bảo có dữ liệu mới nhất ngay sau khi login.
    // Hook useAuth có thể không cập nhật kịp thời khi chuyển trang ngay lập tức.
    const token = sessionStorage.getItem('authToken');
    const userString = sessionStorage.getItem('user');

    const isAuthenticated = !!token;
    let role = null;

    if (isAuthenticated && userString) {
        try {
            const user = JSON.parse(userString);
            role = user?.role;
        } catch (e) {
            console.error("Lỗi phân tích dữ liệu người dùng từ sessionStorage:", e);
        }
    }

    if (!isAuthenticated) {
        // Nếu chưa đăng nhập, điều hướng về trang login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Nếu vai trò không được phép, điều hướng đến trang không có quyền
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;