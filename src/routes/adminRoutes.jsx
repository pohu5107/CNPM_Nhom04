import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, GraduationCap, Car, BarChart3 } from 'lucide-react';
import '../styles/admin.css';

// Import admin pages
import DashboardPage from '../pages/admin/DashboardPage';
import ParentsPage from '../pages/admin/ParentsPage';
import StudentsPage from '../pages/admin/StudentsPage';
import DriversPage from '../pages/admin/DriversPage';

// Admin Navigation Component
// const AdminNavigation = () => {
//   const location = useLocation();
  
//   const navItems = [
//     { 
//       path: '/admin/dashboard', 
//       label: 'Tổng quan', 
//       icon: <BarChart3 size={16} /> 
//     },
//     { 
//       path: '/admin/parents', 
//       label: 'Quản lý Phụ huynh', 
//       icon: <Users size={16} /> 
//     },
//     { 
//       path: '/admin/students', 
//       label: 'Quản lý Học sinh', 
//       icon: <GraduationCap size={16} /> 
//     },
//     { 
//       path: '/admin/drivers', 
//       label: 'Quản lý Tài xế', 
//       icon: <Car size={16} /> 
//     }
//   ];

//   return (
//     <div className="admin-nav">
//       <div className="admin-nav-tabs">
//         {navItems.map(item => (
//           <Link
//             key={item.path}
//             to={item.path}
//             className={`admin-nav-tab ${location.pathname === item.path ? 'active' : ''}`}
//           >
//             {item.icon}
//             {item.label}
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// Admin Layout
// const AdminLayout = ({ children }) => {
//   return (
//     <div className="app">
//       <div className="main-content">
//         {/* Header */}
//         <div style={{ marginBottom: '32px', textAlign: 'center' }}>
//           <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
//             Smart School Bus Tracking System
//           </h1>
//           <p style={{ color: '#64748b', fontSize: '16px' }}>
//             Hệ thống quản lý xe đưa đón học sinh - Admin Dashboard
//           </p>
//         </div>

//         {/* Navigation */}
//         <AdminNavigation />

//         {/* Page Content */}
//         {children}
//       </div>
//     </div>
//   );
// };
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