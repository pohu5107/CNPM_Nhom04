import { NavLink } from "react-router-dom";

export default function DriverNavbar() {
  return (
    <aside
      className="w-64 min-h-screen text-white flex flex-col p-4 flex-shrink-0"
      style={{ backgroundColor: "#174D2C" }}
    >
      {/* Logo / Tiêu đề */}
      <div className="text-3xl rounded-[15px] font-semibold mb-8 text-center tracking-wide mt-4 bg-white text-[#174D2C] rounded-[50px] py-6 shadow-md">
        <div className="text-3xl mb-2">🚌</div>
        <div className="text-lg">DRIVER</div>
      </div>

      {/* Các link menu */}
      <nav className="flex-1 space-y-4">
        {[
          { path: "/driver/schedule", label: "📅 Lịch làm việc", exact: true },
          { path: "/driver/students", label: "👨‍🎓 Học sinh phụ trách" },
        
        ].map(({ path, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                isActive
                  ? "bg-lime-400 text-[#174D2C] shadow-lg"
                  : "text-white hover:bg-white/10 hover:text-lime-300"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-white/20">
        <button className="w-full px-4 py-3 bg-lime-400 text-[#174D2C] rounded-lg font-semibold hover:bg-lime-300 transition-colors">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}