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
import DriverMapPage from "../pages/driver/DriverMapPage";
// Layouts
import DriverLayout from "../layouts/DriverLayout";
import ParentLayout from "../layouts/ParentLayout";
// Parent pages
import ParentPage from "../pages/parent/ParentPage";

// import ReportsPage  from "../pages/admin/ReportsPage.jsx";

export default function AppRouter() {
  return (
    <div className="h-screen text-slate-900 w-full">
      <Routes>
   
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/mapview" replace />} />
        <Route path="/admin/routes" element={<RoutePage />} />
        <Route path="/admin/buses" element={<BusesPage />} />
        <Route path="/admin/schedule" element={<Schedule />} /> 
        <Route path="/admin/drivers"  element={<DriverPage />} />
        <Route path="/admin/students"  element={<StudentsPage />} />
        <Route path="/admin/parents"  element={<ParentsPage />} />
        <Route path="/admin/mapview" element={<MapPage />} />
        
        {/* Driver Routes */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<DriverSchedulePage />} />
          <Route path="schedule" element={<DriverSchedulePage />} />
          <Route path="schedule/:id" element={<DriverScheduleDetailPage />} />
          <Route path="map" element={<DriverMapPage />} />
          <Route path="map/:scheduleId" element={<DriverMapPage />} />
        </Route>

        {/* Parent Routes */}
        <Route path="/parents" element={<ParentLayout />}>
          <Route index element={<ParentPage />} />
        </Route>
      
        {/* <Route path="/admin/reports"  element={<ReportsPage />} /> */}
      </Routes>
    </div>
  );
}
