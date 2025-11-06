import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { schedulesService } from "../../services/schedulesService";
import Header from "../../components/admin/Header";

const CURRENT_DRIVER_ID =1;

export default function DriverScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  useEffect(() => {
    fetchScheduleDetail();
    fetchScheduleStops();
  }, [id]);

  const fetchScheduleDetail = async () => {
    try {
      setLoading(true);
      const response = await schedulesService.getScheduleById(id, CURRENT_DRIVER_ID);
      console.log('🔵 Schedule data received:', response);
      console.log('🔵 Schedule data type:', typeof response, 'Keys:', Object.keys(response || {}));
      
      // Xử lý response - có thể là object hoặc array
      let scheduleData = null;
      if (Array.isArray(response) && response.length > 0) {
        // Nếu là array, lấy phần tử đầu tiên
        scheduleData = response[0];
        console.log('📋 Found array response, taking first element:', scheduleData);
      } else if (response && (response.id || response.schedule_id)) {
        // Nếu là object với id
        scheduleData = response;
        console.log('📋 Found object response:', scheduleData);
      }
      
      if (scheduleData) {
        setSchedule(scheduleData);
        console.log('✅ Schedule data set successfully');
      } else {
        console.log('❌ No valid schedule data found');
        setSchedule(null);
      }
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải chi tiết lịch làm việc: ' + err.message);
      console.error('Error fetching schedule detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleStops = async () => {
    try {
      const stopsData = await schedulesService.getScheduleStops(CURRENT_DRIVER_ID, id);
      console.log('🔵 Stops data received:', stopsData);
      console.log('🔵 Stops data structure:', {
        type: typeof stopsData,
        isArray: Array.isArray(stopsData),
        hasStops: stopsData?.stops ? 'yes' : 'no',
        stopsLength: stopsData?.stops?.length || 0,
        keys: Object.keys(stopsData || {})
      });
      
      // Service đã xử lý để trả về object {scheduleId, routeId, routeName, stops}
      if (stopsData && stopsData.stops && Array.isArray(stopsData.stops)) {
        console.log('✅ Valid stops data found:', stopsData.stops.length, 'stops');
        setStops(stopsData.stops);
      } else {
        console.log('❌ No valid stops data found in response');
        setStops([]);
      }
    } catch (err) {
      console.error('Error fetching stops:', err);
      setStops([]);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await schedulesService.updateScheduleStatus(id, newStatus);
      await fetchScheduleDetail(); // Reload để cập nhật trạng thái mới
    } catch (err) {
      setError('Lỗi khi cập nhật trạng thái: ' + err.message);
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
        <Header title="CHI TIẾT LỊCH LÀM VIỆC" name="Tài xế" />
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
        <Header title="CHI TIẾT LỊCH LÀM VIỆC" name="Tài xế" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            <div className="text-6xl mb-4">⚠️</div>
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
        <Header title="CHI TIẾT LỊCH LÀM VIỆC" name="Tài xế" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-6xl mb-4">📅</div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
      <Header title="CHI TIẾT LỊCH LÀM VIỆC" name="Tài xế" />
      
      <div className="w-full px-6 py-4">
        {/* Thông tin chuyến - Card chính */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#174D2C] mb-2">
                Chi tiết chuyến {id}
              </h1>
              <p className="text-slate-600">
                {schedule.route_name} • 
                {schedule.scheduled_start_time?.substring(0, 5) || schedule.start_time?.substring(0, 5)} – 
                {schedule.scheduled_end_time?.substring(0, 5) || schedule.end_time?.substring(0, 5)}
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
                      // Fallback: dựa vào thời gian
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
                  🕐 {schedule.scheduled_start_time?.substring(0, 5) || schedule.start_time?.substring(0, 5)} – 
                  {schedule.scheduled_end_time?.substring(0, 5) || schedule.end_time?.substring(0, 5)}
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
                  📍 {schedule.start_point}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Điểm kết thúc:</span>
                <span className="font-semibold text-red-600">
                  🏁 {schedule.end_point}
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
                    👥 Xem danh sách
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
            onClick={(e) => e.target === e.currentTarget && setShowStudentsModal(false)}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#174D2C] to-[#1a5530] text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      👥 Danh sách học sinh
                    </h2>
                    <p className="text-green-100 mt-1">
                      Chuyến {id} - {schedule.students?.length || 0} học sinh
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStudentsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">✕</span>
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
                      <th className="px-6 py-4 text-left font-semibold">ĐỊA CHỈ</th>
                      <th className="px-6 py-4 text-left font-semibold">THỜI GIAN ĐÓN</th>
                      <th className="px-6 py-4 text-left font-semibold">PHỤ HUYNH</th>
                      <th className="px-6 py-4 text-left font-semibold">LIÊN HỆ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!schedule.students || schedule.students.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="text-6xl mb-4">👥</div>
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
                          <div className="text-slate-900 max-w-xs">
                            {student.address}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">🚌</span>
                              <span>{student.pickup_time?.substring(0, 5) || 'Chưa có'}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-orange-600">🏠</span>
                              <span className="text-sm text-slate-500">{student.dropoff_time?.substring(0, 5) || 'Chưa có'}</span>
                            </div>
                          </div>
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
                              className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg transition-colors"
                              onClick={() => window.open(`tel:${student.parent_phone || student.phone}`)}
                            >
                              📞 Gọi ngay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Modal Footer */}
              {schedule.students && schedule.students.length > 0 && (
                <div className="bg-gradient-to-r from-slate-50 to-green-50/30 p-6 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-600">
                      📊 Tổng cộng: <span className="font-bold text-slate-900">{schedule.students.length}</span> học sinh
                    </div>
                    <div className="text-sm text-slate-600">
                      Sức chứa xe: <span className="font-bold text-slate-900">{schedule.students.length}/{schedule.max_capacity}</span>
                    </div>
                    <button
                      onClick={() => setShowStudentsModal(false)}
                      className="px-6 py-2 bg-gradient-to-r from-[#174D2C] to-[#1a5530] text-white rounded-lg hover:from-[#0f3820] hover:to-[#134025] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      ✓ Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bảng điểm dừng */}
        <div className="bg-white rounded-xl shadow-lg border border-[#D8E359]/20 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-[#174D2C] flex items-center gap-2">
              📍 Danh sách điểm dừng
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
                    <th className="px-6 py-4 text-center font-semibold">TRẠNG THÁI</th>
                    <th className="px-6 py-4 text-left font-semibold">GHI CHÚ</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stops.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">🛑</div>
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
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stop.status === 'completed' ? 'bg-green-100 text-green-700' :
                        stop.status === 'current' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {stop.status === 'completed' ? '✅ Hoàn thành' :
                         stop.status === 'current' ? '🟡 Hiện tại' : '⏳ Chưa đến'}
                      </span>
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