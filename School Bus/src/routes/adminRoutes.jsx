import { Routes, Route, Navigate } from 'react-router-dom';

// Import admin pages
import DashboardPage from '../pages/admin/DashboardPage';
import ParentsPage from '../pages/admin/ParentsPage';
import StudentsPage from '../pages/admin/StudentsPage';
import DriversPage from '../pages/admin/DriversPage';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};
// Admin Routes
const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
   
        
        {/* Admin pages */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="parents" element={<ParentsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="drivers" element={<DriversPage />} />
        
       
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;