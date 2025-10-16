import { NavLink } from "react-router-dom";

export default function Navbar_Menu() {
  return (
    <aside
      className="w-1/7 min-h-screen text-white flex flex-col p-4"
      style={{ backgroundColor: "#174D2C" }}
    >
      {/* Logo / Tiêu đề */}
      <div className="text-4xl rounded-[15px] font-semibold mb-15 text-center tracking-wide mt-[15px] bg-white text-[#174D2C] rounded-[50px] py-12 shadow-md">
        {/* 🚌 */}
         ADMIN
      </div>

      {/* Các link menu */}
      <nav className="flex-1 space-y-4">
        {[
          { path: "/", label: "Tuyến đường", exact: true },
          { path: "/buses", label: "Xe buýt" },
          { path: "/drivers", label: "Tài xế" },
          { path: "/students", label: "Học sinh" },
          { path: "/parents", label: "Phụ huynh" },
          { path: "/schedule", label: "Lịch trình" },
          { path: "/reports", label: "Báo cáo" },
          { path: "/mapview", label: "Map" },
        ].map(({ path, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-[10px] text-lg font-medium text-center border border-black transition-all duration-200
              ${
                isActive
                  ? "bg-[#D8E359] text-[#174D2C] font-semibold scale-[1.02]"
                  : "hover:bg-[#D8E359] hover:text-[#174D2C] hover:scale-[1.02]"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#D8E359]/50 pt-5 text-center mt-auto">
        <button className="bg-[#D8E359] hover:bg-[#c6d93a] text-[#174D2C] px-4 py-2 rounded-md text-lg font-semibold transition-colors duration-200 border border-black">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
