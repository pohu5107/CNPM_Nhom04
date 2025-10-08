import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, GraduationCap, Car, BarChart3 } from 'lucide-react';
import '../styles/admin.css';

// Import admin pages
import DashboardPage from '../pages/admin/DashboardPage';
import ParentsPage from '../pages/admin/ParentsPage';
import StudentsPage from '../pages/admin/StudentsPage';
import DriversPage from '../pages/admin/DriversPage';


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
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        
        {/* Admin pages */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="parents" element={<ParentsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="drivers" element={<DriversPage />} />
        
        {/* Catch all within admin - redirect to dashboard */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;