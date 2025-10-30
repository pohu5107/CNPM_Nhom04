import { useState } from "react";
import Header from "../../components/admin/Header";
import { Calendar, Clock, Bus, MapPin, Users, ArrowLeft, Eye } from "lucide-react";

export default function Schedule() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const schedules = [
    { ca: 1, time: "06:30 - 7:30", bus: "51B-12345", start: "120 Nguyễn Trãi", end: "273 An Dương Vương", driver: "Nguyễn Văn A", students: 15 },
    { ca: 2, time: "10:30 - 11:30", bus: "51B-86901", start: "273 An Dương Vương", end: "120 Nguyễn Trãi", driver: "Trần Thị B", students: 12 },
    { ca: 3, time: "13:00 - 14:00", bus: "51B-12345", start: "15 Nguyễn Huệ", end: "04 Tôn Đức Thắng", driver: "Lê Văn C", students: 18 },
    { ca: 4, time: "17:30 - 18:30", bus: "51B-86901", start: "04 Tôn Đức Thắng", end: "15 Nguyễn Huệ", driver: "Nguyễn Văn A", students: 14 },
  ];

  const students = [
    { id: 1, name: "Nguyễn Văn A", pickup: "120 Nguyễn Trãi", drop: "273 An Dương Vương", status: "Đã đón", class: "6A1" },
    { id: 2, name: "Nguyễn Văn B", pickup: "19 Lê Lợi", drop: "273 An Dương Vương", status: "Chưa đón", class: "6A2" },
    { id: 3, name: "Nguyễn Văn C", pickup: "253 Nguyễn Thị Minh Khai", drop: "273 An Dương Vương", status: "Chưa đón", class: "7B1" },
    { id: 4, name: "Nguyễn Văn D", pickup: "66 Lý Thường Kiệt", drop: "273 An Dương Vương", status: "Chưa đón", class: "7A1" },
    { id: 5, name: "Nguyễn Văn E", pickup: "134 Lê Đại Hành", drop: "273 An Dương Vương", status: "Chưa đón", class: "8C1" },
  ];

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
              defaultValue="2025-09-30"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Schedule Table */}
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
                    Điểm bắt đầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Điểm kết thúc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Users className="w-4 h-4 inline mr-1" />
                    Học sinh
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((item, index) => (
                  <tr key={item.ca} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {item.ca}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.bus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.start}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.end}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {item.students} học sinh
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedSchedule(item)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
              <div className="text-sm font-semibold text-gray-900">30/09/2025</div>
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
              <div className="text-sm font-semibold text-gray-900">{selectedSchedule.start}</div>
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

      {/* Students Table */}
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
              {students.map((student, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}