import AddBusForm from "./AddBusForm";
import { Eye } from "lucide-react";
import { useState } from "react";
import DetailsBusForm from "./DetailsBusForm";

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
      <div className="flex justify-end">
        <button className="h-10 items-center rounded-md bg-slate-900 px-4 text-white hover:bg-slate-800 hover:cursor-pointer" 
        onClick={() => setIsCreateOpen(true)}>Thêm xe</button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <div className="w-full overflow-x-auto ">
          <table className="min-w-full divide-y divide-slate-200 rounded-lg shadow-sm bg-white">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-tl-lg">
                  Mã xe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Biển số
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Số ghế
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Tài xế
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Tuyến đường
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-tr-lg">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initial.map((bus, idx) => (
                <tr
                  key={bus.id}
                  className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">{bus.code}</td>
                  <td className="px-6 py-4 text-slate-700">{bus.plate}</td>
                  <td className="px-6 py-4 text-slate-700">{bus.seats}</td>
                  <td className="px-6 py-4 text-slate-700">trống</td>
                  <td className="px-6 py-4 text-slate-700">trống</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        bus.status === "Đang hoạt động"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      
                      <button
                        className="h-8 rounded-md border border-slate-300 px-4 text-slate-700 font-medium hover:bg-slate-200 transition flex items-center gap-2"
                        onClick={() => { setSelectedBus(bus); setIsCreateOpenDetails(true); }}
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                      <button
                        className="h-8 rounded-md border border-slate-300 px-4 text-slate-700 font-medium hover:bg-slate-200 transition"
                       
                      >
                        Sửa
                      </button>
                      <button
                        className="h-8 rounded-md bg-red-500 px-4 text-white font-medium hover:bg-red-600 transition"
                        
                      >
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
        onCancel={()=> { setIsCreateOpenDetails(false); setSelectedBus(null); }}
        bus={selectedBus}
      />
      
    </div>
  );
}


