import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AdminRoutes from './routes/adminRoutes';

import BusesPage from './pages/admin/BusesPage';
import RoutePage from './pages/admin/RoutePage';

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<RoutePage />} />
        
      
        <Route path="/buses" element={<BusesPage />} />
        <Route path="/routes" element={<RoutePage />} />
        
        {/* Admin routes của bạn với /admin prefix */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Future routes for other roles */}
        {/* <Route path="/parent/*" element={<ParentRoutes />} /> */}
        {/* <Route path="/driver/*" element={<DriverRoutes />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
