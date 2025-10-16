import { Routes, Route, NavLink  } from "react-router-dom";
import BusesPage from "../pages/admin/BusesPage";
import RoutePage from "../pages/admin/RoutePage";
import Schedule from "../pages/admin/Schedule";
import DriverPage  from "../pages/admin/DriversPage";
import StudentsPage  from "../pages/admin/StudentsPage";
import ParentsPage  from "../pages/admin/ParentsPage.jsx";
import MapPage from "../pages/admin/MapPage.jsx";
// import ReportsPage  from "../pages/admin/ReportsPage.jsx";

export default function AppRouter() {
  return (
    <div className="w-full h-full min-h-screen bg-white text-slate-900">
      <main className="w-full h-full p-4 lg:p-8">
        <Routes>
          <Route path="/" element={<RoutePage />} />
          <Route path="/buses" element={<BusesPage />} />
          <Route path="/schedule" element={<Schedule />} /> 
          <Route path="/drivers"  element={<DriverPage />} />
          <Route path="/students"  element={<StudentsPage />} />
          <Route path="/parents"  element={<ParentsPage />} />
          <Route path="/mapview" element={<MapPage />} />
          {/* <Route path="/reports"  element={<ReportsPage />} /> */}
        </Routes>
      </main>
    </div>
  );
}
