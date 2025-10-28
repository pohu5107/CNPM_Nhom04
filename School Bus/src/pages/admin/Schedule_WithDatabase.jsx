import { useState, useEffect } from "react";
import Header from "../../components/admin/Header";
import { Calendar, Clock, Bus, MapPin, Users, ArrowLeft, Eye } from "lucide-react";
import { schedulesService } from "../../services/schedulesService";

export default function Schedule() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2025-10-23"); // Ngày có dữ liệu mẫu

  // Load schedules from API
  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await schedulesService.getAdminSchedules({ date: selectedDate });
      
      // Transform data để match với format cũ
      const transformedSchedules = data.map(schedule => ({
        id: schedule.id,
        ca: schedule.shift_number,
        shiftType: schedule.shift_type,
        time: `${schedule.start_time?.substring(0,5)} - ${schedule.end_time?.substring(0,5)}`,
        bus: schedule.license_plate || schedule.bus_number,
        start: schedule.start_point,
        end: schedule.end_point,
        driver: schedule.driver_name,
        students: schedule.student_count || 0,
        route: schedule.route_name,
        status: schedule.status
      }));
      
      setSchedules(transformedSchedules);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải lịch trình: ' + err.message);
      console.error('Error fetching schedules:', err);
      // Fallback to mock data if API fails
      setSchedules([
        { id: 1, ca: 1, time: "06:30 - 7:30", bus: "51B-12345", start: "120 Nguyễn Trãi", end: "273 An Dương Vương", driver: "Nguyễn Văn A", students: 15 },
        { id: 2, ca: 2, time: "10:30 - 11:30", bus: "51B-86901", start: "273 An Dương Vương", end: "120 Nguyễn Trãi", driver: "Trần Thị B", students: 12 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleClick = async (schedule) => {
    try {
      setSelectedSchedule(schedule);
      setLoading(true);
      
      // Lấy students theo route từ database
      const result = await schedulesService.getScheduleStudentsByRoute(schedule.id);
      setStudents(result.students || []);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải danh sách học sinh: ' + err.message);
      console.error('Error fetching students:', err);
      // Fallback to mock students
      setStudents([
        { id: 1, name: "Trần Dũng Minh", pickup: "Điểm đón 06:30", drop: "Điểm trả 16:30", status: "Chưa đón", class: "6A1" },
        { id: 2, name: "Phạm An Khang", pickup: "Điểm đón 06:40", drop: "Điểm trả 16:30", status: "Chưa đón", class: "6A1" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Giao diện 1 — LỊCH LÀM VIỆC
  if (!selectedSchedule) {
    return (
      <div className="space-y-6">
        <Header title="PHÂN CÔNG LÁI XE" />
        
        {/* Date Picker Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Ngày làm việc:</span>
            </div>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải lịch trình...</p>
            </div>
          </div>
        ) : (
          /* Schedule Table */
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Danh sách ca làm việc</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ca</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Bus className="w-4 h-4 inline mr-1" />
                      Xe buýt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Tuyến đường
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Users className="w-4 h-4 inline mr-1" />
                      Học sinh
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Không có lịch trình nào cho ngày đã chọn
                      </td>
                    </tr>
                  ) : (
                    schedules.map((schedule, index) => (
                      <tr key={schedule.id || index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Ca {schedule.ca}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.bus}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            <div className="font-medium">{schedule.route || 'Tuyến không xác định'}</div>
                            <div className="text-gray-500 text-xs">{schedule.start} → {schedule.end}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.driver}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {schedule.students} học sinh
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleScheduleClick(schedule)}
                            className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Giao diện 2 — DANH SÁCH HỌC SINH
  return (
    <div className="space-y-6">
      <Header title="DANH SÁCH HỌC SINH" />

      {/* Back Button */}
      <div className="flex items-center">
        <button
          onClick={() => setSelectedSchedule(null)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại lịch làm việc
        </button>
      </div>

      {/* Schedule Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Ngày</div>
              <div className="text-sm font-semibold text-gray-900">{selectedDate}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">#{selectedSchedule.ca}</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Ca</div>
              <div className="text-sm font-semibold text-gray-900">Ca số {selectedSchedule.ca}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Thời gian</div>
              <div className="text-sm font-semibold text-gray-900">{selectedSchedule.time}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Xe buýt</div>
              <div className="text-sm font-semibold text-gray-900">{selectedSchedule.bus}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Tuyến xe</div>
              <div className="text-sm font-semibold text-gray-900">{selectedSchedule.route || selectedSchedule.start}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Tổng học sinh</div>
              <div className="text-sm font-semibold text-gray-900">{students.length} học sinh</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải danh sách học sinh...</p>
          </div>
        </div>
      ) : (
        /* Students Table */
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Danh sách học sinh trên ca {selectedSchedule.ca}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Users className="w-4 h-4 inline mr-1" />
                    Học sinh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Điểm đón
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Điểm trả
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Không có học sinh nào được phân công cho ca này
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={student.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-800">
                              {student.name.split(' ').slice(-1)[0].charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {student.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.pickup}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.drop}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          student.status === "Đã đón" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}