import { Navigate, Outlet } from 'react-router-dom';

const useAuth = () => {
    const token = sessionStorage.getItem('authToken');
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    return {
        isAuthenticated: !!token,
        userRole: user?.role,
    };
};

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;