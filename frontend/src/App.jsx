import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { logout } from "./services/authService";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);

  const handleLogout = () => {
    logout();
    setSession(null);
  };

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  return (
    <DashboardPage
      session={session}
      onLogout={handleLogout}
      onSessionUpdate={setSession}
    />
  );
}

export default App;
