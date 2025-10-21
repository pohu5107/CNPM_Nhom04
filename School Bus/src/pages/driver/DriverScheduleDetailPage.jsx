import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockDrivers } from "../../data/mockData";

const CURRENT_DRIVER_ID = 1;

export default function DriverScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDriver = mockDrivers.find(d => d.id === CURRENT_DRIVER_ID);

  // Mock data cho chuyến chi tiết theo thiết kế của bạn
  const scheduleDetail = {
    id: id,
    code: id,
    date: "20/10/2025",
    ca: id === "CH001" ? 1 : id === "CH002" ? 2 : 3,
    time: id === "CH001" ? "06:30 – 07:30" : id === "CH002" ? "10:00 – 11:00" : "17:00 – 18:00",
    route: id === "CH001" ? "Nguyễn Văn Linh – Huỳnh Tấn Phát" : 
           id === "CH002" ? "Lê Lợi – Nguyễn Huệ" : "Trường Sa – Hoàng Sa",
    busNumber: id === "CH001" ? "51B-12345" : id === "CH002" ? "51B-86901" : "51C-34567",
    driver: currentDriver?.name || "Nguyễn Văn Tài",
    startPoint: id === "CH001" ? "120 Nguyễn Trãi" : 
                id === "CH002" ? "273 An Dương Vương" : "134 Lê Đại Hành",
    endPoint: id === "CH001" ? "273 An Dương Vương" : 
              id === "CH002" ? "120 Nguyễn Trãi" : "273 An Dương Vương",
    stopCount: id === "CH001" ? 4 : 3,
    status: id === "CH001" ? "⏳ Chưa bắt đầu" : 
            id === "CH002" ? "🚍 Đang chạy" : "✅ Hoàn thành",
    statusColor: id === "CH001" ? "bg-gray-100 text-gray-700" : 
                 id === "CH002" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
  };

  // Danh sách điểm dừng theo thiết kế của bạn
  const stops = [
    {
      order: 1,
      name: scheduleDetail.startPoint,
      type: "Bắt đầu",
      estimatedTime: scheduleDetail.time.split(" – ")[0],
      studentCount: "-",
      status: "completed",
      note: "-"
    },
    {
      order: 2,
      name: "19 Lê Lợi",
      type: "Đón học sinh",
      estimatedTime: id === "CH001" ? "06:35" : id === "CH002" ? "10:05" : "17:05",
      studentCount: "3 học sinh",
      status: id === "CH001" ? "pending" : id === "CH002" ? "current" : "completed",
      note: "Gần trường THCS A"
    },
    {
      order: 3,
      name: "35 Nguyễn Hữu Thọ",
      type: "Đón học sinh",
      estimatedTime: id === "CH001" ? "06:45" : id === "CH002" ? "10:15" : "17:15",
      studentCount: "5 học sinh",
      status: "pending",
      note: "Khu dân cư Him Lam"
    },
    {
      order: 4,
      name: scheduleDetail.endPoint,
      type: "Kết thúc",
      estimatedTime: scheduleDetail.time.split(" – ")[1],
      studentCount: "-",
      status: "pending",
      note: "Trả tại cổng chính"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return "✅";
      case "current": return "🟡";
      case "pending": return "⏳";
      default: return "⏳";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "current": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="w-full h-full p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Chi tiết chuyến {scheduleDetail.code}
            </h1>
            <p className="text-slate-600">
              {scheduleDetail.route} • {scheduleDetail.time}
            </p>
          </div>
          <button
            onClick={() => navigate("/driver")}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            ← Quay lại lịch làm việc
          </button>
        </div>

        {/* Thông tin chuyến - Card theo thiết kế của bạn */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            🚌 Thông tin chuyến
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">🆔 Mã chuyến:</span>
                <span className="font-semibold text-slate-900">{scheduleDetail.code}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">📅 Ngày:</span>
                <span className="font-semibold text-slate-900">{scheduleDetail.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">⚡ Ca:</span>
                <span className="font-semibold text-slate-900">{scheduleDetail.ca}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">🕒 Thời gian:</span>
                <span className="font-semibold text-slate-900">{scheduleDetail.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">🛣️ Tuyến đường:</span>
                <span className="font-semibold text-slate-900">{scheduleDetail.route}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">🚌 Xe buýt:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                  {scheduleDetail.busNumber}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">👨‍✈️ Tài xế:</span>
                <span className="font-semibold text-slate-900">{scheduleDetail.driver}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">📍 Điểm bắt đầu:</span>
                <span className="font-semibold text-green-600">{scheduleDetail.startPoint}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">🏁 Điểm kết thúc:</span>
                <span className="font-semibold text-red-600">{scheduleDetail.endPoint}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">🛑 Số điểm dừng:</span>
                <span className="font-semibold text-slate-900">{scheduleDetail.stopCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium min-w-[120px]">🔄 Trạng thái:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${scheduleDetail.statusColor}`}>
                  {scheduleDetail.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách điểm dừng - Table theo thiết kế của bạn */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              📍 Danh sách điểm dừng
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-4 py-4 text-left font-semibold text-sm">Thứ tự</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">📍 Tên điểm</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">🏷️ Loại</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">🕒 Thời gian dự kiến đến</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">👨‍🎓 Học sinh</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm">🔄 Trạng thái</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm">📝 Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stops.map((stop, index) => (
                  <tr key={stop.order} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-bold text-slate-900 text-center text-lg">
                      {stop.order}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{stop.name}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stop.type === 'Bắt đầu' ? 'bg-green-100 text-green-800' :
                        stop.type === 'Kết thúc' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {stop.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-mono font-semibold text-slate-900">{stop.estimatedTime}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-medium text-slate-700">{stop.studentCount}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(stop.status)} gap-1`}>
                        {getStatusIcon(stop.status)} 
                        {stop.status === 'completed' ? 'Hoàn thành' :
                         stop.status === 'current' ? 'Đang tới' : 'Chưa tới'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-600">{stop.note}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer - Nút hành động */}
        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
            🚀 Bắt đầu chuyến
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            📱 Cập nhật trạng thái
          </button>
          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors">
            ⚠️ Báo cáo sự cố
          </button>
        </div>
      </div>
    </div>
  );
}