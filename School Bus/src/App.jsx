import { BrowserRouter, useLocation } from "react-router-dom";
import AppRouter from "./routes/AppRouter.jsx";
import Navbar_Menu from "./components/admin/Navbar_Menu.jsx";
import DriverNavbar from "./components/driver/DriverNavbar.jsx";

// Navbar selector based on current route
function NavbarSelector() {
  const location = useLocation();
  
  // Don't show navbar for /driver paths - DriverLayout handles its own navbar
  if (location.pathname.startsWith('/driver')) {
    return null;
  }
  
  // Show Admin Navbar for /admin paths and root path
  if (location.pathname.startsWith('/admin') || location.pathname === '/') {
    return <Navbar_Menu />;
  }
  
  // Default to Admin Navbar
  return <Navbar_Menu />;
}

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full">
        <NavbarSelector />
        <main className="flex-1 w-full overflow-hidden">
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
