// Test Component để kiểm tra layout với và không có Sidebar
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/admin/DashboardPage';
import ParentsPage from '../pages/admin/ParentsPage';
import StudentsPage from '../pages/admin/StudentsPage';
import DriversPage from '../pages/admin/DriversPage';

// Layout test với Sidebar (mô phỏng layout của nhánh khác)
const TestSidebarLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">School Bus</h2>
          <nav className="space-y-2">
            <div className="py-2 px-3 bg-slate-700 rounded">Dashboard</div>
            <div className="py-2 px-3 hover:bg-slate-700 rounded cursor-pointer">Phụ huynh</div>
            <div className="py-2 px-3 hover:bg-slate-700 rounded cursor-pointer">Học sinh</div>
            <div className="py-2 px-3 hover:bg-slate-700 rounded cursor-pointer">Tài xế</div>
            <div className="py-2 px-3 hover:bg-slate-700 rounded cursor-pointer">Xe buýt</div>
            <div className="py-2 px-3 hover:bg-slate-700 rounded cursor-pointer">Tuyến đường</div>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-8 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-slate-900">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Admin User</span>
              <button className="bg-red-500 text-white px-4 py-2 rounded text-sm">Đăng xuất</button>
            </div>
          </div>
        </header>
        
       
        <main className="flex-1 overflow-auto">
          <div className="p-8 w-full">
            <div className="w-full max-w-none space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Layout test không có Sidebar (hiện tại)
const TestSimpleLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full h-full">
        <div className="p-8 w-full">
          <div className="w-full max-w-none space-y-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component test chính
const LayoutTester = () => {
  const [layoutType, setLayoutType] = useState('simple');
  
  const LayoutComponent = layoutType === 'sidebar' ? TestSidebarLayout : TestSimpleLayout;
  
  return (
    <div>
      {/* Toggle để test 2 layout */}
      <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
        <h3 className="font-semibold mb-2">Test Layout:</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="layout" 
              value="simple" 
              checked={layoutType === 'simple'}
              onChange={(e) => setLayoutType(e.target.value)}
            />
            Simple (hiện tại)
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="layout" 
              value="sidebar" 
              checked={layoutType === 'sidebar'}
              onChange={(e) => setLayoutType(e.target.value)}
            />
            Với Sidebar + Header
          </label>
        </div>
      </div>

      <LayoutComponent>
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="parents" element={<ParentsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </LayoutComponent>
    </div>
  );
};

export default LayoutTester;