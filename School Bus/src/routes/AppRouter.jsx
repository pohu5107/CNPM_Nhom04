import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import BusesPage from "../pages/admin/BusesPage";
import RoutePage from "../pages/admin/RoutePage";
import Schedule from "../pages/admin/Schedule";
import DriverPage  from "../pages/admin/DriversPage";
import StudentsPage  from "../pages/admin/StudentsPage";
import ParentsPage  from "../pages/admin/ParentsPage.jsx";
import MapPage from "../pages/admin/MapPage.jsx";
// Driver pages
import DriverSchedulePage from "../pages/driver/DriverSchedulePage";
import DriverScheduleDetailPage from "../pages/driver/DriverScheduleDetailPage";
import DriverStudentsPage from "../pages/driver/DriverStudentsPage";
// import ReportsPage  from "../pages/admin/ReportsPage.jsx";

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-white text-slate-900 w-full">
      <main className="w-full max-w-none px-3 sm:px-4 md:px-6 py-4">
        <Routes>
          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin/routes" replace />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/routes" replace />} />
          <Route path="/admin/routes" element={<RoutePage />} />
          <Route path="/admin/buses" element={<BusesPage />} />
          <Route path="/admin/schedule" element={<Schedule />} /> 
          <Route path="/admin/drivers"  element={<DriverPage />} />
          <Route path="/admin/students"  element={<StudentsPage />} />
          <Route path="/admin/parents"  element={<ParentsPage />} />
          <Route path="/admin/mapview" element={<MapPage />} />
          
          {/* Driver Routes */}
          <Route path="/driver" element={<DriverSchedulePage />} />
          <Route path="/driver/schedule" element={<DriverSchedulePage />} />
          <Route path="/driver/schedule/:id" element={<DriverScheduleDetailPage />} />
          <Route path="/driver/students" element={<DriverStudentsPage />} />
          
          {/* <Route path="/reports"  element={<ReportsPage />} /> */}
        </Routes>
      </main>
    </div>
  );
}
