import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, GraduationCap, Car, BarChart3, Bus, Route as RouteIcon } from 'lucide-react';
import '../styles/admin.css';

// Import admin pages
import DashboardPage from '../pages/admin/DashboardPage';
import ParentsPage from '../pages/admin/ParentsPage';
import StudentsPage from '../pages/admin/StudentsPage';
import DriversPage from '../pages/admin/DriversPage';
// Import pages từ người khác
import BusesPage from '../pages/admin/BusesPage';
import RoutePage from '../pages/admin/RoutePage';


    const AdminLayout = ({ children }) => {
  return (
    <div className="admin-page-container">
      {children}
    </div>
  );
};
// Admin Routes
const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        {/* Default redirect to dashboard */}
        {/* <Route path="/" element={<Navigate to="dashboard" replace />} /> */}
        
        {/* Admin pages */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="parents" element={<ParentsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="drivers" element={<DriversPage />} />
        
        {/* Default redirect to dashboard if no path */}
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;