// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Nếu người dùng không có quyền truy cập, chuyển hướng về trang phù hợp
        return <Navigate to={user.role === 'admin' ? '/mapview' : '/notifications'} />;
    }

    return children;
};

export default PrivateRoute;