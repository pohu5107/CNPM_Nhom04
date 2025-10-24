import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { schedulesService } from "../../services/schedulesService";
import Header from "../../components/admin/Header";

const CURRENT_DRIVER_ID = 1;

export default function DriverScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchScheduleDetail();
    fetchScheduleStops();
  }, [id]);

  const fetchScheduleDetail = async () => {
    try {
      setLoading(true);
      const response = await schedulesService.getScheduleById(id);
      console.log('🔵 Schedule data received:', response);
      console.log('🔵 Schedule data type:', typeof response, 'Keys:', Object.keys(response || {}));
      
      // Interceptor đã xử lý response, trả về data trực tiếp
      if (response && (response.id || response.schedule_id)) {
        setSchedule(response);
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
                {schedule.route_name} • {schedule.start_time?.substring(0, 5)} – {schedule.end_time?.substring(0, 5)}
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
                <span className="font-bold text-xl text-[#174D2C]">Ca {schedule.shift_number}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Thời gian:</span>
                <span className="font-bold text-lg text-slate-900">
                  {schedule.start_time?.substring(0, 5)} – {schedule.end_time?.substring(0, 5)}
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
                <span className="font-semibold text-green-600">{schedule.start_point}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Điểm kết thúc:</span>
                <span className="font-semibold text-red-600">{schedule.end_point}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">Học sinh:</span>
                <span className="font-semibold text-slate-900">{schedule.student_count}/{schedule.max_capacity}</span>
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

        {/* Danh sách điểm dừng - Bảng theo thiết kế */}
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
                  <th className="px-6 py-4 text-left font-semibold">STT</th>
                  <th className="px-6 py-4 text-left font-semibold">TÊN ĐIỂM DỪNG</th>
                  <th className="px-6 py-4 text-left font-semibold">LOẠI</th>
                  <th className="px-6 py-4 text-left font-semibold">THỜI GIAN DỰ KIẾN</th>
                  <th className="px-6 py-4 text-center font-semibold">HỌC SINH</th>
                  <th className="px-6 py-4 text-center font-semibold">TRẠNG THÁI</th>
                  <th className="px-6 py-4 text-left font-semibold">GHI CHÚ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stops.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">🛑</div>
                      <p className="text-slate-500 text-lg">Chưa có thông tin điểm dừng cho tuyến này</p>
                      <p className="text-slate-400 text-sm mt-2">Vui lòng liên hệ quản trị viên để cập nhật</p>
                    </td>
                  </tr>
                ) : stops.map((stop, index) => (
                  <tr 
                    key={stop.order} 
                    className={`hover:bg-slate-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 text-lg text-center">
                      {stop.order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{stop.name}</div>
                      {stop.address && <div className="text-sm text-slate-500 mt-1">{stop.address}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {stop.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-900">
                      {stop.estimatedTime}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {stop.studentCount}
                      </span>
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