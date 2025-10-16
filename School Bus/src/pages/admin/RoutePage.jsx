import AddRouteForm from "./AddRouteForm";
import { Eye , SlidersHorizontal} from "lucide-react";
import DetailsBusForm from "./DetailsBusForm";
import { useState } from "react";

const initial = [
    { id: 1, name: "Điện Biên Phủ - 3/2", stops: "Bến xe Miền Đông - Ngã tư Hàng Xanh - Vòng xoay Dân Chủ" },
    { id: 2, name: "An Dương Vương - Hồng Bàng", stops: "Chợ Lớn - Đại học Sư phạm - Vòng xoay Cộng Hòa" },
    { id: 3, name: "Nguyễn Văn Linh - Huỳnh Tấn Phát", stops: "Phú Mỹ Hưng - Cầu Tân Thuận - Quận 4" },
    { id: 4, name: "Lê Lợi - Nguyễn Huệ", stops: "Bến Thành - Nhà hát Thành phố - Phố đi bộ Nguyễn Huệ" },
    { id: 5, name: "Cách Mạng Tháng 8 - Trường Chinh", stops: "Công viên Lê Thị Riêng - Bảy Hiền - Âu Cơ" },
    { id: 6, name: "Phan Xích Long - Phan Đăng Lưu", stops: "Phú Nhuận - Ngã tư Phú Nhuận - Nguyễn Kiệm" },
    { id: 7, name: "Lý Thường Kiệt - Tô Hiến Thành", stops: "Nhà thi đấu Phú Thọ - Đại học Bách Khoa - CMT8" },
    { id: 8, name: "Trường Sa - Hoàng Sa", stops: "Kênh Nhiêu Lộc - Cầu Bông - Cầu Thị Nghè" },
    { id: 9, name: "Nguyễn Thị Minh Khai - Võ Văn Tần", stops: "Hồ Con Rùa - Dinh Độc Lập - Bệnh viện Từ Dũ" },
    { id: 10, name: "Phạm Văn Đồng - Quốc lộ 13", stops: "Công viên Gia Định - Ngã tư Bình Triệu - Linh Xuân" },
  ];
  

export default function RoutePage() {
    const [isOpenFormAdd, setIsOpenFormAdd] = useState(false);
    const [routes, setRoutes] = useState(initial);

    const handleDelete = (id) => {
      setRoutes(prev => prev.filter(route => route.id !== id));
    };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
            <button className="flex items-center gap-1 rounded-xl p-2  bg-green-200 text-green-700">
            <SlidersHorizontal/> Lọc</button>
        </div>
        <div className="flex justify-end">
          <input className="border-2 rounded-2xl p-2 mr-2 " type="text" placeholder="Tìm kiếm tuyến đường" />
          <button className="h-10 items-center rounded-md bg-slate-900 px-4 text-white hover:bg-slate-800 hover:cursor-pointer" 
          onClick={() => setIsOpenFormAdd(true)}>Thêm tuyến đường</button>
        </div>
      </div>
     

      <div className="overflow-x-auto rounded-lg border">
        <div className="w-full overflow-x-auto ">
          <table className="min-w-full divide-y divide-slate-200 rounded-lg shadow-sm bg-white">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-tl-lg">
                  Mã tuyến đường
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Tên tuyến đường
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Điểm dừng
                </th>
               
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-tr-lg">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routes.map((route, idx) => (
                <tr
                  key={route.id}
                  className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">{route.id}</td>
                  <td className="px-6 py-4 text-slate-700">{route.name}</td>
                  <td className="px-6 py-4 text-slate-700">{route.stops}</td>
                  
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      
                      <button
                        className="h-8 rounded-md border border-slate-300 px-4 text-slate-700 font-medium hover:bg-slate-200 transition flex items-center gap-2"
                        
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
                        onClick={() => handleDelete(route.id)}
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
        {routes.length === 0 && (
          <div className="p-6 text-center text-slate-500">Chưa có tuyến đường nào</div>
        )}
      </div>
      <AddRouteForm
        visible = {isOpenFormAdd} 
        onCancel = {()=>{setIsOpenFormAdd(false)}}

      />
    </div>
  );
}


