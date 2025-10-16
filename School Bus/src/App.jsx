import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter.jsx";
import Navbar_Menu from "./components/admin/Navbar_Menu.jsx";

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Navbar_Menu />
        <main>
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
