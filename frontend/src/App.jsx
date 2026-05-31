import { Routes, Route } from "react-router-dom";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Attendance from "./pages/Attendance";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EmployeeDashboard />} />
      <Route path="/attendance" element={<Attendance />} />
    </Routes>
  );
}

export default App;