import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar_Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside
      className="h-screen w-56 sm:w-60 md:w-64 lg:w-72 flex-shrink-0 text-white flex flex-col p-4 bg-bg overflow-y-auto overflow-x-hidden"
    >
      {/* Logo / Tiêu đề */}
      <div className="pb-4 items-center flex justify-center ">
        {/* 🚌 */}
        {/* download về */}
        <NavLink to="/mapview">
          <img
            src="https://www.shutterstock.com/image-vector/illustration-yellow-school-bus-flat-600nw-2246845245.jpg"
            alt="Ảnh logo"
            className="w-24 h-24 rounded-full object-cover border cursor-pointer"
          />
        </NavLink>
      </div>

      {/* Các link menu */}
      <nav className="flex-1 space-y-4">
        {[
          // Menu items cho admin
          ...(user?.role === 'admin' ? [
            { path: "/mapview", label: "Map", exact: true },
            { path: "/routes", label: "Tuyến đường" },
            { path: "/buses", label: "Xe buýt" },
            { path: "/drivers", label: "Tài xế" },
            { path: "/students", label: "Học sinh" },
            { path: "/parents", label: "Phụ huynh" },
            { path: "/schedule", label: "Lịch trình" },
            { path: "/reports", label: "Báo cáo" },
          ] : []),
          // Menu items cho phụ huynh
          ...(user?.role === 'parent' ? [
            { path: "/notifications", label: "Thông báo" },
            { path: "/track-bus", label: "Theo dõi vị trí xe" },
          ] : []),
        ].map(({ path, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `block p-1 rounded-[10px] text-lg font-medium text-center  transition-all duration-100
              ${
                isActive
                  ? "bg-[#D8E359] text-[#174D2C] font-semibold scale-[1.02]"
                  : "hover:bg-white hover:text-[#174D2C] hover:scale-[1.02]"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#D8E359]/50 pt-5 text-center mt-auto">
         {/* <button className="bg-[#D8E359] hover:bg-[#c6d93a] text-[#174D2C] px-4 py-2 rounded-md text-lg font-semibold transition-colors duration-200 border border-black"></button> */}
        <div className="text-sm mb-2">
          {user?.username} ({user?.role === 'admin' ? 'Quản trị viên' : 'Phụ huynh'})
        </div>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }} 
          className="bg-[#D8E359] hover:bg-[#c6d93a] text-[#174D2C] px-4 py-2 rounded-md text-lg font-semibold transition-colors duration-200 border border-black"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
