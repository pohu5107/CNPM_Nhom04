import { NavLink } from "react-router-dom";

export default function DriverNavbar() {
  return (
    <aside
      className="h-screen w-56 sm:w-60 md:w-64 lg:w-72 flex-shrink-0 text-black flex flex-col p-4 bg overflow-y-auto overflow-x-hidden border shadow-lg"
    >
      {/* Logo / Tiêu đề - Match Admin style */}
      <div className="pb-4 items-center flex justify-center">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border cursor-pointer shadow-lg">
          <div className="text-center">
            <div className="text-3xl text-black">�</div>
            <div className="text-sm font-bold text-black">DRIVER</div>
          </div>
        </div>
      </div>

      {/* Các link menu - Match Admin style */}
      <nav className="flex-1 space-y-4">
        {[
          { path: "/driver/schedule", label: "Lịch làm việc", exact: true },
          { path: "/driver/map", label: "Bắt đầu chuyến", exact: false },
        ].map(({ path, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `block p-1 rounded-[10px] text-lg font-medium text-center transition-all duration-100
              ${
                isActive
                  ? "bg-gray-300 text-black font-semibold scale-[1.02]"
                  : "hover:bg-white hover:text-black hover:scale-[1.02]"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
       <div className="border-t border-[#D8E359]/50 pt-5 text-center mt-auto">
          <button className="bg-white hover:bg-[#c6d93a] text-[#174D2C] px-4 py-2 rounded-md text-lg font-semibold transition-colors duration-200 border border-black">
            Đăng xuất
          </button>
        </div>
    
      
    </aside>
  );
}