import { Outlet } from "react-router-dom";
import DriverNavbar from "../components/driver/DriverNavbar";

export default function DriverLayout() {
  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 to-green-50/30 overflow-hidden">
      <DriverNavbar key="driver-navbar-main" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}