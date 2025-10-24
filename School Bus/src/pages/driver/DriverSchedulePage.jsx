import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { schedulesService } from "../../services/schedulesService";
import Header from "../../components/admin/Header";

// Giả sử driver hiện tại có ID = 1  
const CURRENT_DRIVER_ID = 1; // Đổi sang driver khác để test nếu chưa có đăng nhập

export default function DriverSchedulePage() {
  const [selectedDate, setSelectedDate] = useState("2025-10-23");
  const [timeFilter, setTimeFilter] = useState("today"); // today, week, all
  const [schedules, setSchedules] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDriver, setCurrentDriver] = useState({ name: 'Đang tải...', driverCode: 'TX001' });
  const navigate = useNavigate();

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchSchedules();
    fetchSummary();
  }, [selectedDate, timeFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = {
        date: selectedDate,
        timeFilter: timeFilter
      };
      
      const data = await schedulesService.getDriverSchedules(CURRENT_DRIVER_ID, params);
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải lịch làm việc: ' + err.message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await schedulesService.getDriverSummary(CURRENT_DRIVER_ID, selectedDate);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  // Lấy thông tin driver hiện tại từ localStorage hoặc context
  useEffect(() => {
    // Giả lập thông tin driver - trong thực tế sẽ lấy từ authentication context
    const driverInfo = {
      1: { name: 'Nguyễn Văn A', driverCode: 'TX001' },
      2: { name: 'Trần Thị B', driverCode: 'TX002' },
      3: { name: 'Lê Văn C', driverCode: 'TX003' }
    };
    
    setCurrentDriver(driverInfo[CURRENT_DRIVER_ID] || { name: 'Unknown Driver', driverCode: 'TX???' });
  }, []);
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
  };

  const handleViewDetail = (scheduleId) => {
    navigate(`/driver/schedule/${scheduleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
      {/* Header chuẩn Admin style */}
      <Header title="QUẢN LÝ LỊCH LÀM VIỆC" name={currentDriver?.name || 'Tài xế'} />
      
      <div className="w-full px-6 py-4">
        {/* Driver Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#174D2C] rounded-full flex items-center justify-center text-white text-2xl">
                🚍
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#174D2C]">Mã tài xế: {currentDriver?.driverCode}</h2>
                <p className="text-slate-600">Lịch trình hôm nay</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Ngày làm việc</div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-4 py-2 border border-[#D8E359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174D2C] text-[#174D2C] font-medium"
              />
            </div>
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            {[
              { value: "today", label: "Hôm nay", icon: "📅" },
              { value: "week", label: "Tuần này", icon: "🗓️" },
              { value: "all", label: "Tất cả", icon: "📋" }
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => handleTimeFilterChange(value)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  timeFilter === value
                    ? "bg-[#D8E359] text-[#174D2C] shadow-md scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-[#D8E359]/20 hover:text-[#174D2C]"
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Main Schedule Table */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D8E359] border-t-[#174D2C] mx-auto mb-4"></div>
              <p className="text-[#174D2C] font-medium">Đang tải lịch làm việc...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-slate-500 text-lg">Không có lịch làm việc nào trong thời gian này.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-6 py-4 text-left font-semibold">CA</th>
                    <th className="px-6 py-4 text-left font-semibold">THỜI GIAN</th>
                    <th className="px-6 py-4 text-left font-semibold">TUYẾN ĐƯỜNG</th>
                    <th className="px-6 py-4 text-left font-semibold">XE BUÝT</th>
                    <th className="px-6 py-4 text-left font-semibold">ĐIỂM BẮT ĐẦU</th>
                    <th className="px-6 py-4 text-left font-semibold">ĐIỂM KẾT THÚC</th>
                    <th className="px-6 py-4 text-center font-semibold">SỐ ĐIỂM DỪNG</th>
                    <th className="px-6 py-4 text-center font-semibold">HỌC SINH</th>
                    <th className="px-6 py-4 text-center font-semibold">TRẠNG THÁI</th>
                    <th className="px-6 py-4 text-center font-semibold">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((schedule, index) => (
                    <tr 
                      key={schedule.id} 
                      className={`hover:bg-slate-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 text-lg">
                        {schedule.ca}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{schedule.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700">{schedule.route}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded text-center">
                          {schedule.busNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {schedule.startPoint}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {schedule.endPoint}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {schedule.stopCount} điểm
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {schedule.studentCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${schedule.statusColor}`}>
                          {schedule.statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetail(schedule.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Cards - Admin style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-[#D8E359]/20 text-center hover:shadow-xl transition-shadow duration-200">
            <div className="text-4xl mb-3">🚍</div>
            <div className="text-sm text-slate-600 font-medium">Tổng số ca</div>
            <div className="text-3xl font-bold text-[#174D2C]">{summary.total_shifts || 0}</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-[#D8E359]/20 text-center hover:shadow-xl transition-shadow duration-200">
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-sm text-slate-600 font-medium">Chưa bắt đầu</div>
            <div className="text-3xl font-bold text-gray-600">
              {summary.pending || 0}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-[#D8E359]/20 text-center hover:shadow-xl transition-shadow duration-200">
            <div className="text-4xl mb-3">🚍</div>
            <div className="text-sm text-slate-600 font-medium">Đang chạy</div>
            <div className="text-3xl font-bold text-blue-600">
              {summary.in_progress || 0}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-[#D8E359]/20 text-center hover:shadow-xl transition-shadow duration-200">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-sm text-slate-600 font-medium">Hoàn thành</div>
            <div className="text-3xl font-bold text-green-600">
              {summary.completed || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}