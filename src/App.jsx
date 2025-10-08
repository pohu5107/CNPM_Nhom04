import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AdminRoutes from './routes/adminRoutes';

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Admin routes with /admin prefix */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Future routes for other roles */}
        {/* <Route path="/parent/*" element={<ParentRoutes />} /> */}
        {/* <Route path="/driver/*" element={<DriverRoutes />} /> */}
        
        {/* Catch all - redirect to admin */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
