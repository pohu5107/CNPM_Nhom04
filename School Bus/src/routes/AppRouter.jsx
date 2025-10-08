import { Routes, Route, NavLink } from "react-router-dom";
import BusesPage from "../pages/admin/BusesPage";
import RoutePage from "../pages/admin/RoutePage";

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="container mx-auto p-4">
        <Routes>
          {/* <Route path="/" element={<div className="text-slate-700"><BusesPage /></div>} /> */}
          <Route path="/" element={<div className="text-slate-700"><RoutePage /></div>} />
        </Routes>
      </main>
    </div>
  );
}