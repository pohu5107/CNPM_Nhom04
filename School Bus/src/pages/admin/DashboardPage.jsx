import React from 'react';
import { mockParents, mockStudents, mockDrivers } from '../../data/mockData';

const DashboardPage = () => {
  // Calculate stats
  const stats = {
    totalRoutes: 5, // Mock số tuyến
    totalBuses: 8,  // Mock số xe bus
    totalStudents: mockStudents.length,
    activeStudents: mockStudents.filter(s => s.status === 'active' || !s.status).length,
    totalParents: mockParents.length,
    activeParents: mockParents.filter(p => p.status === 'active').length,
    totalDrivers: mockDrivers.length,
    activeDrivers: mockDrivers.filter(d => d.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="text-sm text-slate-600">
          Tổng quan hệ thống quản lý xe bus trường học
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Tuyến xe */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold mb-3 text-purple-500">
            Tuyến xe
          </h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {stats.totalRoutes}
          </div>
          <div className="text-sm text-slate-600">
            Tuyến đang hoạt động
          </div>
        </div>

        {/* Xe bus */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold mb-3 text-indigo-500">
            Xe bus
          </h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {stats.totalBuses}
          </div>
          <div className="text-sm text-slate-600">
            Xe đang sử dụng
          </div>
        </div>

        {/* Học sinh */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold mb-3 text-green-500">
            Học sinh
          </h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {stats.totalStudents}
          </div>
          <div className="text-sm text-slate-600">
            <span className="text-green-500">{stats.activeStudents} đăng ký</span>
          </div>
        </div>

        {/* Phụ huynh */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold mb-3 text-blue-500">
            Phụ huynh
          </h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {stats.totalParents}
          </div>
          <div className="text-sm text-slate-600">
            <span className="text-green-500">{stats.activeParents} hoạt động</span>
            {' • '}
            <span className="text-red-500">{stats.totalParents - stats.activeParents} không hoạt động</span>
          </div>
        </div>

        {/* Tài xế */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold mb-3 text-amber-500">
            Tài xế
          </h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {stats.totalDrivers}
          </div>
          <div className="text-sm text-slate-600">
            <span className="text-green-500">{stats.activeDrivers} hoạt động</span>
            {' • '}
            <span className="text-red-500">{stats.totalDrivers - stats.activeDrivers} không hoạt động</span>
          </div>
        </div>
      </div>

      {/* Tính năng sẽ phát triển */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">
          🚀 Tính năng sẽ phát triển
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📍</span>
              </div>
              <h4 className="font-medium text-slate-900">Theo dõi GPS</h4>
            </div>
            <p className="text-sm text-slate-600">Theo dõi vị trí xe bus theo thời gian thực, cập nhật cho phụ huynh</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📱</span>
              </div>
              <h4 className="font-medium text-slate-900">App mobile</h4>
            </div>
            <p className="text-sm text-slate-600">Ứng dụng di động cho phụ huynh theo dõi con em trên xe bus</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🔔</span>
              </div>
              <h4 className="font-medium text-slate-900">Thông báo tự động</h4>
            </div>
            <p className="text-sm text-slate-600">Gửi thông báo SMS/email khi học sinh lên/xuống xe</p>
          </div>

    

         
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;