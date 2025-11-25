import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter.jsx";

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
