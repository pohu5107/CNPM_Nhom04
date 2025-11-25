import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { schedulesService } from "../../services/schedulesService";
import Header from "../../components/admin/Header";
import { FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import { FaBus, FaRocket } from 'react-icons/fa';


const getCurrentDriverId = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) return null;
    
    // Gọi API để lấy driver_id từ user_id - hoạt động với BẤT KỲ driver nào trong DB
    const response = await fetch(`http://localhost:5000/api/drivers/by-user/${user.id}`, {
      cache: 'no-cache'
    });
    
    // Kiểm tra nếu response không phải JSON (có thể là HTML error page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('API trả về HTML thay vì JSON. Backend có thể đang lỗi.');
      return null;
    }
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      return data.driver_id;
    } else {
      console.warn('User không phải là driver hoặc driver không active:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Lỗi khi gọi API lấy driver ID:', error);
    return null; // Không còn fallback - chỉ dùng API
  }
};

export default function DriverSchedulePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [timeFilter, setTimeFilter] = useState('today');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDriver, setCurrentDriver] = useState({ name: 'Đang tải...', driverCode: 'TX001' });
  const navigate = useNavigate();


  useEffect(() => {
    fetchSchedules();
  }, [selectedDate, timeFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
      // Only send `date` when filtering by today. For 'week' and 'all' we omit date
=======
      
      const driverId = await getCurrentDriverId();
      if (!driverId) {
        setError('Không tìm thấy thông tin tài xế. Vui lòng đăng nhập lại.');
        return;
      }
      
>>>>>>> origin
      const params = {};
      if (timeFilter === 'today' && selectedDate) {
        params.date = selectedDate;
      }

<<<<<<< HEAD
      const data = await schedulesService.getDriverSchedules(CURRENT_DRIVER_ID, params);
=======
      const data = await schedulesService.getDriverSchedules(driverId, params);
>>>>>>> origin
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải lịch làm việc: ' + err.message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    const loadDriverInfo = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const driverId = await getCurrentDriverId();
        
        if (driverId) {
          // Gọi API để lấy thông tin driver chi tiết từ database
          try {
            const driverResponse = await fetch(`http://localhost:5000/api/drivers/${driverId}`);
            const driverData = await driverResponse.json();
            
            if (driverData.success) {
              setCurrentDriver({
                name: driverData.data.name || 'Tài xế',
                driverCode: `TX${driverId.toString().padStart(3, '0')}`
              });
            } else {
              setCurrentDriver({ 
                name: user?.username || 'Tài xế', 
                driverCode: `TX${driverId.toString().padStart(3, '0')}` 
              });
            }
          } catch (error) {
            console.error('Lỗi khi lấy thông tin driver:', error);
            setCurrentDriver({ 
              name: user?.username || 'Tài xế', 
              driverCode: `TX${driverId.toString().padStart(3, '0')}` 
            });
          }
        } else {
          setCurrentDriver({ name: 'Không xác định', driverCode: 'TX???' });
        }
      } catch (error) {
        setCurrentDriver({ name: 'Lỗi tải thông tin', driverCode: 'TX???' });
      }
    };
    
    loadDriverInfo();
  }, []);
  
  const handleDateChange = (newDate) => {

    setSelectedDate(newDate);
  };

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
<<<<<<< HEAD
    
    if (newFilter !== 'today') {
      setSelectedDate('');
    } else {
    
      if (!selectedDate) {
        const today = new Date().toISOString().slice(0, 10);
        setSelectedDate(today);
      }
=======
    if (newFilter !== 'today') {
      setSelectedDate('');
    } else {
      setSelectedDate(prev => prev || today);
>>>>>>> origin
    }
  };

  const handleViewDetail = (scheduleId) => {
  
    navigate(`/driver/schedule/${scheduleId}`);
  };

  const handleStartRoute = (scheduleId) => {
    navigate(`/driver/map/${scheduleId}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Admin  */}
      <Header title="QUẢN LÝ LỊCH LÀM VIỆC" name={currentDriver?.name || 'Tài xế'} />
      
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Driver Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#174D2C] rounded-full flex items-center justify-center text-white">
                <FaBus className="w-7 h-7" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#174D2C]">Mã tài xế: {currentDriver?.driverCode}</h2>
                <p className="text-slate-600">Tên tài xế: {currentDriver?.name}</p>
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
<<<<<<< HEAD
              { value: "today", label: "Hôm nay", icon: "📅" },
          
=======
              { value: "today", label: "Hôm nay", icon: <FiCalendar className="w-5 h-5" aria-hidden="true" /> },

>>>>>>> origin
              { value: "all", label: "Tất cả", icon: "" }
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
                <span className="flex items-center">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
              <div className="flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Main Schedule Table */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 overflow-hidden">
          {loading && (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D8E359] border-t-[#174D2C] mx-auto mb-4"></div>
              <p className="text-[#174D2C] font-medium">Đang tải lịch làm việc...</p>
            </div>
          )}

          {!loading && schedules.length === 0 && (
            <div className="p-12 text-center">
              <div className="mb-4 flex justify-center"><FiCalendar className="w-12 h-12" aria-hidden="true" /></div>
              <p className="text-slate-500 text-lg">Không có lịch làm việc nào trong thời gian này.</p>
            </div>
          )}

          {!loading && schedules.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-6 py-4 text-left font-semibold">CA</th>
                    <th className="px-6 py-4 text-left font-semibold">THỜI GIAN</th>
                    <th className="px-6 py-4 text-left font-semibold">TUYẾN ĐƯỜNG</th>
                    <th className="px-6 py-4 text-left font-semibold">XE BUÝT</th>
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
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${schedule.statusColor}`}>
                          {schedule.statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(schedule.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                          {(schedule.statusText === 'Chưa bắt đầu' || schedule.status === 'not_started') && (
                            <button
                              onClick={() => handleStartRoute(schedule.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              <FaRocket className="w-4 h-4 mr-2" aria-hidden="true" /> Bắt đầu tuyến
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}