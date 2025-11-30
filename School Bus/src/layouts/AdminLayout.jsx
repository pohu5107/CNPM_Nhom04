import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa thông tin đăng nhập khỏi sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    // Chuyển hướng về trang đăng nhập
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <aside className="h-screen w-56 sm:w-60 md:w-64 lg:w-72 flex-shrink-0 text-white flex flex-col p-4 bg-bg overflow-y-auto">
        <div className="pb-4 items-center flex justify-center">
          <NavLink to="/admin/mapview">
            <img
              src="https://www.shutterstock.com/image-vector/illustration-yellow-school-bus-flat-600nw-2246845245.jpg"
              alt="Ảnh logo"
              className="w-24 h-24 rounded-full object-cover border cursor-pointer"
            />
          </NavLink>
        </div>
        <nav className="flex-1 space-y-4">
          {[
            { path: "/admin/mapview", label: "Map", exact: true },
            { path: "/admin/routes", label: "Tuyến đường" },
            { path: "/admin/buses", label: "Xe buýt" },
            { path: "/admin/drivers", label: "Tài xế" },
            { path: "/admin/students", label: "Học sinh" },
            { path: "/admin/parents", label: "Phụ huynh" },
            { path: "/admin/schedule", label: "Lịch trình" },
            { path: "/admin/user", label: "Tài Khoản" },
            // { path: "/admin/reports", label: "Báo cáo" },
          ].map(({ path, label, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `block p-1 rounded-[10px] text-lg font-medium text-center  transition-all duration-100
              ${isActive
                  ? "bg-[#D8E359] text-[#174D2C] font-semibold scale-[1.02]"
                  : "hover:bg-white hover:text-[#174D2C] hover:scale-[1.02]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[#D8E359]/50 pt-5 text-center mt-auto">
          <button
            onClick={handleLogout}
            className="bg-[#D8E359] hover:bg-[#c6d93a] text-[#174D2C] px-4 py-2 rounded-md text-lg font-semibold transition-colors duration-200 border border-black w-full"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
