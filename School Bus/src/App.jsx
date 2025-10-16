import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routes/adminRoutes';
import AppRouter from './routes/AppRouter';
import LayoutTester from './routes/LayoutTester';

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Layout Test Route - để test responsive */}
        <Route path="/test-layout/*" element={<LayoutTester />} />
        
        {/* Admin routes với /admin prefix */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Other routes */}
        <Route path="/*" element={<AppRouter />} />
      </Routes>
    </Router>
  );
}

export default App;
