import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { schedulesService } from "../../services/schedulesService";
import Header from "../../components/admin/Header";
import { FiCalendar, FiUsers, FiPhone, FiX, FiMapPin } from 'react-icons/fi';

// Lấy driver ID từ user_id qua API - hoạt động với BẤT KỲ driver nào trong database
const getCurrentDriverId = async () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user?.id) return null;
    
    // Gọi API để lấy driver_id từ user_id - không giới hạn chỉ 3 drivers
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

export default function DriverScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [currentDriverName, setCurrentDriverName] = useState("Tài xế");



  useEffect(() => {
    fetchScheduleDetail();
    fetchScheduleStops();
    // Load current logged-in user's display name (simple, from sessionStorage)
    try {
      const user = JSON.parse(sessionStorage.getItem('user')) || null;
      if (user) setCurrentDriverName(user.username || user.name || 'Tài xế');
    } catch (_) {
      // ignore
    }
  }, [id]);

  const fetchScheduleDetail = async () => {
    try {
      setLoading(true);
      
      const driverId = await getCurrentDriverId();
      if (!driverId) {
        setError('Không tìm thấy thông tin tài xế. Vui lòng đăng nhập lại.');
        return;
      }
      
      const response = await schedulesService.getScheduleById(id, driverId);
      const scheduleData = Array.isArray(response) ? response[0] : response;
      
      setSchedule(scheduleData || null);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải chi tiết lịch làm việc: ' + err.message);
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleStops = async () => {
    try {
      const driverId = await getCurrentDriverId();
      if (!driverId) {
        setStops([]);
        return;
      }
      
      const stopsData = await schedulesService.getScheduleStops(driverId, id);
      setStops(stopsData?.stops || []);
    } catch (err) {
      setStops([]);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
        <Header title="CHI TIẾT LỊCH LÀM VIỆC" name={schedule?.driver_name || currentDriverName} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D8E359] border-t-[#174D2C] mx-auto mb-4"></div>
            <p className="text-[#174D2C] font-medium">Đang tải chi tiết lịch làm việc...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
        <Header title="CHI TIẾT LỊCH LÀM VIỆC" name={schedule?.driver_name || currentDriverName} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            <div className="text-6xl mb-4"></div>
            <p className="mb-4 text-lg">{error}</p>
            <button 
              onClick={() => navigate(-1)} 
              className="px-6 py-3 bg-[#174D2C] text-white rounded-lg hover:bg-[#2a5d42] transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
        <Header title="CHI TIẾT LỊCH LÀM VIỆC" name={schedule?.driver_name || currentDriverName} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-4 flex justify-center"><FiCalendar className="w-12 h-12" aria-hidden="true" /></div>
            <p className="text-slate-500 text-lg">Không tìm thấy thông tin lịch làm việc</p>
            <button 
              onClick={() => navigate(-1)} 
              className="mt-4 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-green-50/30">
      <Header title="CHI TIẾT LỊCH LÀM VIỆC" name={schedule?.driver_name || currentDriverName} />
      
      <div className="flex-1 overflow-y-auto w-full px-6 py-4">
        {/* Thông tin chuyến - Card chính */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#174D2C] mb-2">
                Chi tiết chuyến {id}
              </h1>
              <p className="text-slate-600">
                {schedule.route_name} • 
                {schedule.scheduled_start_time?.substring(0, 5) } – 
                {schedule.scheduled_end_time?.substring(0, 5) }
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ← Quay lại
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Mã chuyến:</span>
                <span className="font-bold text-lg text-[#174D2C]">{id}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Ngày:</span>
                <span className="font-semibold text-slate-900">{new Date(schedule.date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Ca:</span>
                <span className="font-bold text-xl text-[#174D2C]">
                  {(() => {
                    // Xác định loại ca dựa trên shift_type
                    if (schedule.shift_type) {
                      const shiftTypeText = schedule.shift_type === 'morning' ? 'Sáng' : 
                                           schedule.shift_type === 'afternoon' ? 'Chiều' : 
                                           schedule.shift_type === 'evening' ? 'Tối' : 'Khác';
                      return `Ca ${shiftTypeText}`;
                    } else {
                   
                      const startHour = schedule.start_time ? parseInt(schedule.start_time.split(':')[0]) : 0;
               
                      let shiftTypeText = '';
                      if (startHour >= 6 && startHour < 12) {
                        shiftTypeText = 'Sáng';
                      } else if (startHour >= 12 && startHour < 18) {
                        shiftTypeText = 'Chiều';
                      } else {
                        shiftTypeText = 'Tối';
                      }
                      return `Ca ${shiftTypeText}`;
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Thời gian:</span>
                <span className="font-bold text-lg text-slate-900">
                   {schedule.scheduled_start_time?.substring(0, 5) } – 
                  {schedule.scheduled_end_time?.substring(0, 5)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Tuyến đường:</span>
                <span className="font-semibold text-slate-900">{schedule.route_name}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Xe buýt:</span>
                <span className="font-mono font-bold text-lg bg-[#D8E359]/20 px-3 py-2 rounded text-[#174D2C]">
                  {schedule.license_plate}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Tài xế:</span>
                <span className="font-semibold text-slate-900">{schedule.driver_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Điểm bắt đầu:</span>
                <span className="font-semibold text-green-600">
                  {schedule.start_point || 'Không xác định'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Điểm kết thúc:</span>
                <span className="font-semibold text-red-600">
                  {schedule.end_point || 'Không xác định'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Học sinh:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {schedule.students?.length || 0}/{schedule.max_capacity}
                  </span>
                  <button
                    onClick={() => setShowStudentsModal(true)}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Xem danh sách
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Trạng thái:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${schedule.statusColor}`}>
                  {schedule.statusText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal danh sách học sinh */}
        {showStudentsModal && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            // onClick={(e) => e.target === e.currentTarget && setShowStudentsModal(false)}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#174D2C] to-[#1a5530] text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FiUsers className="w-6 h-6" aria-hidden="true" /> Danh sách học sinh
                    </h2>
                    <p className="text-green-100 mt-1">
                      Chuyến {id} - {schedule.students?.length || 0} học sinh
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStudentsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
                    aria-label="Đóng"
                  >
                    <FiX className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="overflow-auto max-h-[calc(90vh-120px)]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">STT</th>
                      <th className="px-6 py-4 text-left font-semibold">HỌ TÊN</th>
                      <th className="px-6 py-4 text-left font-semibold">LỚP</th>
                
                      <th className="px-6 py-4 text-left font-semibold">PHỤ HUYNH</th>
                      <th className="px-6 py-4 text-left font-semibold">LIÊN HỆ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!schedule.students || schedule.students.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="text-6xl mb-4"></div>
                          <p className="text-slate-500 text-lg">Chưa có học sinh được phân công cho chuyến này</p>
                          <p className="text-slate-400 text-sm mt-2">Vui lòng liên hệ quản trị viên để cập nhật danh sách</p>
                        </td>
                      </tr>
                    ) : schedule.students.map((student, index) => (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900 text-lg text-center">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-sm text-slate-500">ID: {student.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                            {student.class} - Khối {student.grade}
                          </span>
                        </td>
                     
                      
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {student.parent_name || 'Chưa có thông tin'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-slate-900 mb-1">
                            {student.parent_phone || student.phone || 'Chưa có'}
                          </div>
                          {(student.parent_phone || student.phone) && (
                            <button 
                              className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-2"
                              onClick={() => window.open(`tel:${student.parent_phone || student.phone}`)}
                              aria-label={`Gọi ${student.parent_name || student.name}`}
                            >
                              <FiPhone className="w-4 h-4" aria-hidden="true" />
                              <span>Gọi ngay</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
          
            </div>
          </div>
        )}

        {/* Bảng điểm dừng */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-[#174D2C] flex items-center gap-2">
              <FiMapPin className="w-5 h-5" aria-hidden="true" /> Danh sách điểm dừng
            </h2>
            <p className="text-slate-600 mt-1">
              Tuyến {schedule.route_name} - {stops.length} điểm dừng
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-6 py-4 text-center font-semibold">STT</th>
                    <th className="px-6 py-4 text-left font-semibold">TÊN ĐIỂM DỪNG</th>
                    <th className="px-6 py-4 text-center font-semibold">LOẠI</th>
                    <th className="px-6 py-4 text-center font-semibold">THỜI GIAN DỰ KIẾN</th>
                    <th className="px-6 py-4 text-left font-semibold">GHI CHÚ</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stops.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4"></div>
                      <p className="text-slate-500 text-lg">Chưa có thông tin điểm dừng cho tuyến này</p>
                      <p className="text-slate-400 text-sm mt-2">Vui lòng liên hệ quản trị viên để cập nhật</p>
                    </td>
                  </tr>
                ) : stops.map((stop, index) => (
                  <tr 
                    key={`${stop.order}-${index}`} 
                    className={`hover:bg-slate-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 text-lg text-center">
                      {stop.order === 0 ? '1' : 
                       stop.order === 99 ? stops.length : 
                       stop.order + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{stop.name}</div>
                      {stop.address && <div className="text-sm text-slate-500 mt-1">{stop.address}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        stop.order === 0 ? 'bg-green-100 text-green-700' :
                        stop.order === 99 ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {stop.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-900 text-center font-semibold">
                      {stop.estimatedTime}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {stop.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}