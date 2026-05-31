import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [employees, setEmployees] = useState([]);
  const navigationItems = ["Dashboard", "My Schedule", "Work Location"];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/employees")
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
      });
  }, []);

  return (
    <div className="app-layout">
      <aside className="side-navigation" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            TA
          </span>
          <span className="brand-name">Team Attendance</span>
        </div>

        <nav className="nav-menu">
          {navigationItems.map((item) => (
            <a
              className={item === "Dashboard" ? "nav-link active" : "nav-link"}
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>

        <button className="logout-button" type="button">
          Logout
        </button>
      </aside>

      <main style={{ padding: "30px", fontFamily: "Arial" }} id="dashboard">
        <h1>Team Attendance App</h1>
        <h2>Employees</h2>

        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Manager</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.employee_id}>
                <td>{employee.employee_id}</td>
                <td>{employee.full_name}</td>
                <td>{employee.email}</td>
                <td>{employee.employment_type}</td>
                <td>{employee.manager_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default App;