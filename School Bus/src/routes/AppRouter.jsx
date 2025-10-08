import { Routes, Route, NavLink } from "react-router-dom";
import BusesPage from "../pages/admin/BusesPage";

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<div className="text-slate-700"><BusesPage /></div>} />
        </Routes>
      </main>
    </div>
  );
}