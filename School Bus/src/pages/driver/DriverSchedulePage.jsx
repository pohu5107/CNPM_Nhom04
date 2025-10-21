import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockDrivers, mockStudents } from "../../data/mockData";

// Giả sử driver hiện tại có ID = 1
const CURRENT_DRIVER_ID = 1;

export default function DriverSchedulePage() {
  const [selectedDate, setSelectedDate] = useState("2025-10-20");
  const [timeFilter, setTimeFilter] = useState("today"); // today, week, all
  const navigate = useNavigate();

  // Lấy thông tin driver hiện tại
  const currentDriver = mockDrivers.find(d => d.id === CURRENT_DRIVER_ID);
  
  // Tạo lịch làm việc chi tiết cho driver theo thiết kế của bạn
  const schedules = [
    {
      id: "CH001",
      ca: 1,
      time: "06:30 - 07:30",
      route: "Nguyễn Văn Linh – Huỳnh Tấn Phát",
      busNumber: "51B-12345",
      startPoint: "120 Nguyễn Trãi",
      endPoint: "273 An Dương Vương",
      stopCount: 4,
      studentCount: "15/20",
      status: "pending", // pending, running, completed
      statusText: "⏳ Chưa bắt đầu",
      statusColor: "bg-gray-100 text-gray-700"
    },
    {
      id: "CH002", 
      ca: 2,
      time: "10:00 - 11:00",
      route: "Lê Lợi – Nguyễn Huệ",
      busNumber: "51B-86901",
      startPoint: "273 An Dương Vương",
      endPoint: "120 Nguyễn Trãi", 
      stopCount: 3,
      studentCount: "12/18",
      status: "running",
      statusText: "🚍 Đang chạy",
      statusColor: "bg-blue-100 text-blue-700"
    },
    {
      id: "CH003",
      ca: 3,
      time: "17:00 - 18:00", 
      route: "Trường Sa – Hoàng Sa",
      busNumber: "51C-34567",
      startPoint: "134 Lê Đại Hành",
      endPoint: "273 An Dương Vương",
      stopCount: 4,
      studentCount: "18/22",
      status: "completed",
      statusText: "✅ Hoàn thành",
      statusColor: "bg-green-100 text-green-700"
    }
  ];

  const handleViewDetail = (scheduleId) => {
    navigate(`/driver/schedule/${scheduleId}`);
  };

  return (
    <div className="w-full h-full p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Lịch Phân Công Hàng Ngày
          </h1>
          <p className="text-slate-600">
            Xin chào, <strong>{currentDriver?.name}</strong> - Mã TX: {currentDriver?.driverCode}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Ngày:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="text-sm text-slate-600">
                📅 {new Date(selectedDate).toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {[
                { value: "today", label: "Hôm nay" },
                { value: "week", label: "Tuần này" },
                { value: "all", label: "Tất cả" }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTimeFilter(value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeFilter === value
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Table - Theo thiết kế của bạn */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-4 py-4 text-left font-semibold text-sm">Ca</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">🕒 Thời Gian</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">🛣️ Tuyến Đường</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">🚌 Xe Buýt</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">� Điểm Bắt Đầu</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">🏁 Điểm Kết Thúc</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">� Số Điểm Dừng</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">👨‍🎓 Học Sinh</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm">🔄 Trạng Thái</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm">⚡ Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((schedule, index) => (
                  <tr 
                    key={schedule.id} 
                    className={`hover:bg-slate-50 ${
                      schedule.status === 'pending' ? 'bg-gray-50' :
                      schedule.status === 'running' ? 'bg-blue-50' :
                      'bg-green-50'
                    }`}
                  >
                    <td className="px-4 py-4 font-bold text-slate-900 text-lg">
                      {schedule.ca}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{schedule.time}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-700">{schedule.route}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-center">
                        {schedule.busNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-green-600 font-medium">
                        🟢 {schedule.startPoint}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-red-600 font-medium">
                        🔴 {schedule.endPoint}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                        {schedule.stopCount} điểm
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {schedule.studentCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${schedule.statusColor}`}>
                        {schedule.statusText}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleViewDetail(schedule.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors gap-1"
                      >
                        🔍 Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-3xl mb-2">�</div>
            <div className="text-sm text-slate-600">Tổng số ca</div>
            <div className="text-2xl font-bold text-slate-900">{schedules.length}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-sm text-slate-600">Chưa bắt đầu</div>
            <div className="text-2xl font-bold text-gray-600">
              {schedules.filter(s => s.status === 'pending').length}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-3xl mb-2">�</div>
            <div className="text-sm text-slate-600">Đang chạy</div>
            <div className="text-2xl font-bold text-blue-600">
              {schedules.filter(s => s.status === 'running').length}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-sm text-slate-600">Hoàn thành</div>
            <div className="text-2xl font-bold text-green-600">
              {schedules.filter(s => s.status === 'completed').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}