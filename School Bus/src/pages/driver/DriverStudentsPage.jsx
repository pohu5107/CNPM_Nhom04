import { useState } from "react";
import { mockStudents, mockDrivers } from "../../data/mockData";

const CURRENT_DRIVER_ID = 1;

export default function DriverStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Lấy thông tin driver hiện tại
  const currentDriver = mockDrivers.find(d => d.id === CURRENT_DRIVER_ID);
  
  // Lấy danh sách học sinh mà driver này phụ trách
  // Giả sử driver phụ trách các học sinh có ID từ 1-6
  const myStudents = mockStudents.slice(0, 6).map(student => ({
    ...student,
    pickupTime: "07:00",
    dropTime: "17:00", 
    pickupPoint: "120 Nguyễn Trãi",
    dropPoint: "273 An Dương Vương",
    status: Math.random() > 0.5 ? "Hoạt động" : "Nghỉ học"
  }));

  // Filter students
  const filteredStudents = myStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Học Sinh Phụ Tr책
          </h1>
          <p className="text-slate-600">
            Danh sách học sinh được phân công cho tài xế <strong>{currentDriver?.name}</strong>
          </p>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tìm kiếm học sinh
              </label>
              <input
                type="text"
                placeholder="Tên hoặc mã học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">👨‍🎓</div>
            <div className="text-sm text-slate-600">Tổng học sinh</div>
            <div className="text-2xl font-bold text-slate-900">{myStudents.length}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm text-slate-600">Đang hoạt động</div>
            <div className="text-2xl font-bold text-green-600">
              {myStudents.filter(s => s.status === "Hoạt động").length}
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">STT</th>
                  <th className="px-6 py-4 text-left font-semibold">👨‍🎓 Học Sinh</th>
                  <th className="px-6 py-4 text-left font-semibold">🏠 Lớp</th>
                  <th className="px-6 py-4 text-left font-semibold">🚏 Điểm Đón</th>
                  <th className="px-6 py-4 text-left font-semibold">📍 Điểm Trả</th>
                  <th className="px-6 py-4 text-left font-semibold">🕒 Giờ Đón/Trả</th>
                  <th className="px-6 py-4 text-center font-semibold">🔄 Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{student.name}</div>
                        <div className="text-sm text-slate-600">Mã: {student.studentCode}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {student.class}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {student.pickupPoint}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {student.dropPoint}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="text-sm">
                          <div>Đón: {student.pickupTime}</div>
                          <div>Trả: {student.dropTime}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.status === 'Hoạt động' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      Không tìm thấy học sinh nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}