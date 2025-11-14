import { Outlet } from "react-router-dom";
import ParentNavbar from "../components/parent/ParentNavbar";

export default function ParentLayout() {
  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden">
      <ParentNavbar key="parent-navbar-main" />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}