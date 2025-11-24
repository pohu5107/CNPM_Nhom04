import { Routes, Route, Navigate } from "react-router-dom";

// --- Core Components ---
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import UnauthorizedPage from "../pages/UnauthorizedPage.jsx"; // Trang báo lỗi không có quyền

// --- Layouts (chỉ import để dùng trong route, không render trực tiếp) ---
import AdminLayout from "../layouts/AdminLayout.jsx";
import DriverLayout from "../layouts/DriverLayout";
import ParentLayout from "../layouts/ParentLayout";

// --- Admin Pages ---
import BusesPage from "../pages/admin/BusesPage";
import RoutePage from "../pages/admin/RoutePage";
import Schedule from "../pages/admin/Schedule";
import DriverPage from "../pages/admin/DriversPage";
import StudentsPage from "../pages/admin/StudentsPage";
import ParentsPage from "../pages/admin/ParentsPage.jsx";
import MapPage from "../pages/admin/MapPage.jsx";
import UserPage from "../pages/admin/UserPage.jsx";

// --- Driver Pages ---
import DriverSchedulePage from "../pages/driver/DriverSchedulePage";
import DriverScheduleDetailPage from "../pages/driver/DriverScheduleDetailPage";
import DriverMapPage from "../pages/driver/DriverMapPage";

// --- Parent Pages ---
import ParentPage from "../pages/parent/ParentPage";

export default function AppRouter() {
  return (
    <div className="h-screen text-slate-900 w-full">
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* --- Admin Protected Routes --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/mapview" replace />} />
            <Route path="mapview" element={<MapPage />} />
            <Route path="routes" element={<RoutePage />} />
            <Route path="buses" element={<BusesPage />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="drivers" element={<DriverPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="parents" element={<ParentsPage />} />
            <Route path="user" element={<UserPage />} />
          </Route>
        </Route>

        {/* --- Driver Protected Routes --- */}
        <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<Navigate to="schedule" replace />} />
            <Route path="schedule" element={<DriverSchedulePage />} />
            <Route path="schedule/:id" element={<DriverScheduleDetailPage />} />
            <Route path="map" element={<DriverMapPage />} />
            <Route path="map/:scheduleId" element={<DriverMapPage />} />
          </Route>
        </Route>

        {/* --- Parent Protected Routes --- */}
        <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<ParentPage />} />
          </Route>
        </Route>

        {/* --- Fallback Routes --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
