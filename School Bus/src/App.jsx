import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routes/adminRoutes';
import AppRouter from './routes/AppRouter';

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes với /admin prefix */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
   
        <Route path="/*" element={<AppRouter />} />
      </Routes>
    </Router>
  );
}

export default App;
