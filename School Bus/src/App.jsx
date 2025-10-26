import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter.jsx";
import Navbar_Menu from "./components/admin/Navbar_Menu.jsx";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

// Wrapper component để sử dụng useAuth hook
const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Chỉ hiển thị Navbar_Menu khi đã đăng nhập */}
      {user && <Navbar_Menu />}
      <main className={`flex-1 min-w-0 ${!user ? 'p-0' : ''}`}>
        <AppRouter />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      {/* <div className="flex min-h-screen overflow-x-hidden">
        <Navbar_Menu />
        <main className="flex-1 min-w-0">
          <AppRouter />
        </main>
      </div> */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
