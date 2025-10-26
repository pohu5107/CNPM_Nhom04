import { Routes, Route, Navigate } from "react-router-dom";
import BusesPage from "../pages/admin/BusesPage";
import RoutePage from "../pages/admin/RoutePage";
import Schedule from "../pages/admin/Schedule";
import DriverPage from "../pages/admin/DriversPage";
import StudentsPage from "../pages/admin/StudentsPage";
import ParentsPage from "../pages/admin/ParentsPage.jsx";
import MapPage from "../pages/admin/MapPage.jsx";
import LoginPage from "../pages/LoginPage";
import Notif_WarningPage from "../pages/parent/Notif_WarningPage";
import PrivateRoute from "../components/PrivateRoute";
import { useAuth } from "../context/AuthContext";
// import ReportsPage  from "../pages/admin/ReportsPage.jsx";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen text-slate-900 w-full">
      <main className="w-full max-w-none px-3 sm:px-4 md:px-6 py-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Redirect root to appropriate page based on user role */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={user ? (user.role === 'admin' ? '/mapview' : '/notifications') : '/login'} 
                replace 
              />
            } 
          />

          {/* Admin Routes */}
          <Route path="/routes" element={
            <PrivateRoute allowedRoles={['admin']}>
              <RoutePage />
            </PrivateRoute>
          } />
          <Route path="/buses" element={
            <PrivateRoute allowedRoles={['admin']}>
              <BusesPage />
            </PrivateRoute>
          } />
          <Route path="/schedule" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Schedule />
            </PrivateRoute>
          } />
          <Route path="/drivers" element={
            <PrivateRoute allowedRoles={['admin']}>
              <DriverPage />
            </PrivateRoute>
          } />
          <Route path="/students" element={
            <PrivateRoute allowedRoles={['admin']}>
              <StudentsPage />
            </PrivateRoute>
          } />
          <Route path="/parents" element={
            <PrivateRoute allowedRoles={['admin']}>
              <ParentsPage />
            </PrivateRoute>
          } />
          <Route path="/mapview" element={
            <PrivateRoute allowedRoles={['admin']}>
              <MapPage />
            </PrivateRoute>
          } />

          {/* Parent Routes */}
          <Route path="/notifications" element={
            <PrivateRoute allowedRoles={['parent']}>
              <Notif_WarningPage />
            </PrivateRoute>
          } />
          <Route path="/track-bus" element={
            <PrivateRoute allowedRoles={['parent']}>
              <MapPage />
            </PrivateRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}
