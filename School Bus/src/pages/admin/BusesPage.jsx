import AddBusForm from "./AddBusForm";
import { Eye, SlidersHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import DetailsBusForm from "./DetailsBusForm";
import Header from "../../components/admin/Header";

const initial = [
  { id: 1, code: "BUS-01", plate: "51A-123.45", seats: 45, status: "Đang hoạt động" },
  { id: 2, code: "BUS-02", plate: "51B-678.90", seats: 30, status: "Không hoạt động" },
  { id: 3, code: "BUS-03", plate: "51C-234.56", seats: 40, status: "Đang bảo trì" },
  { id: 4, code: "BUS-04", plate: "51D-789.01", seats: 50, status: "Đang hoạt động" },
  { id: 5, code: "BUS-05", plate: "51E-345.67", seats: 35, status: "Đang hoạt động" },
  { id: 6, code: "BUS-06", plate: "51F-890.12", seats: 60, status: "Không hoạt động" },
  { id: 7, code: "BUS-07", plate: "51G-456.78", seats: 55, status: "Đang hoạt động" },
  { id: 8, code: "BUS-08", plate: "51H-901.23", seats: 42, status: "Đang bảo trì" },
  { id: 9, code: "BUS-09", plate: "51K-567.89", seats: 33, status: "Đang hoạt động" },
  { id: 10, code: "BUS-10", plate: "51L-012.34", seats: 48, status: "Không hoạt động" },
];


export default function BusesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateOpenDetails, setIsCreateOpenDetails] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  return (
    <div className="space-y-6">
      <Header title="Quản lý xe buýt" name="Hoàng Phong Vũ" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <button className="flex items-center gap-2 rounded-lg py-2 px-4 bg-green-200 text-green-700 text-base font-semibold hover:bg-green-300 transition">
            <SlidersHorizontal className="w-5 h-5" />
            Lọc
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch justify-end gap-2 md:gap-3">
          <input 
            className="border-2 rounded-2xl px-4 py-2 text-base outline-[#D8E359] min-w-[220px] w-full sm:w-[260px] focus:ring-2 focus:ring-[#D8E359]" 
            type="text" 
            placeholder="Tìm kiếm xe theo biển số" 
          />
          <button
            className="flex items-center gap-2 h-12 rounded-xl bg-slate-900 px-5 text-white font-semibold text-base hover:bg-slate-800 transition"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-5 h-5" />
            Thêm xe
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 shadow">
        <div className="w-full max-h-[70vh] overflow-y-auto">
          <table className="w-full table-auto divide-y divide-slate-200 rounded-lg shadow-sm bg-white">
            <thead>
              <tr>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-tl-lg">
                  Mã xe
                </th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Biển số
                </th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Số ghế
                </th>
                <th className="hidden md:table-cell px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Tài xế
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Tuyến đường
                </th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Trạng thái
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-tr-lg">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initial.map((bus, idx) => (
                <tr
                  key={bus.id}
                  className={`transition-colors text-sm sm:text-base ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}
                >
                  <td className="px-3 sm:px-4 py-3 sm:py-4 font-semibold text-slate-900">{bus.code}</td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-700">{bus.plate}</td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-700">{bus.seats}</td>
                  <td className="hidden md:table-cell px-3 sm:px-4 py-3 sm:py-4 text-slate-700">trống</td>
                  <td className="hidden lg:table-cell px-3 sm:px-4 py-3 sm:py-4 text-slate-700">trống</td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        bus.status === "Đang hoạt động"
                          ? "bg-green-100 text-green-700"
                          : bus.status === "Đang bảo trì"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        className="flex items-center gap-1 h-8 rounded-lg border border-slate-300 px-3 text-slate-700 font-medium hover:bg-slate-200 transition text-sm"
                        onClick={() => { setSelectedBus(bus); setIsCreateOpenDetails(true); }}
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                      <button
                        className="flex items-center gap-1 h-8 rounded-lg border border-slate-300 px-3 text-slate-700 font-medium hover:bg-slate-200 transition text-sm"
                      >
                        <Pencil className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        className="flex items-center gap-1 h-8 rounded-lg bg-red-500 px-3 text-white font-medium hover:bg-red-600 transition text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {initial.length === 0 && (
          <div className="p-6 text-center text-slate-500">Chưa có xe nào</div>
        )}
      </div>
      <AddBusForm
        visible={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        title="Thêm xe"
      />
      <DetailsBusForm
        visible={isCreateOpenDetails}
        onCancel={() => { setIsCreateOpenDetails(false); setSelectedBus(null); }}
        bus={selectedBus}
      />
    </div>
  );
}


