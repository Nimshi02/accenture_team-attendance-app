import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { getStoredSession, logout } from "./services/authService";
import "./App.css";

function App() {
  const [session, setSession] = useState(() => getStoredSession());

  const handleLogout = () => {
    logout();
    setSession(null);
  };

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  return <DashboardPage session={session} onLogout={handleLogout} />;
}

export default App;
