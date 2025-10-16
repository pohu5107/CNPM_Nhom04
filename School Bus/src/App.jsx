import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter.jsx";
import Navbar_Menu from "./components/admin/Navbar_Menu.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen overflow-x-hidden">
        <Navbar_Menu />
        <main className="flex-1 min-w-0">
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  );
}
