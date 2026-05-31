
import "../App.css";
export default function EmployeeDashboard() {
  

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <h3>Acenture team attendance app</h3>

        <button className="active">Dashboard</button>
        <button>My Schedule</button>
        <button>Work Location</button>
        <button>Requests</button>
        <a className="side-link" href="/attendance">Attendance</a>
        <button>Notifications</button>
        <button>Profile</button>
        <button>Logout</button>
      </aside>

      <main className="main-area">
        <div className="top-row">
          <div>
            <h1>Welcome back, John! 👋</h1>
            <p>Here’s your attendance and work location summary.</p>
          </div>
          <button className="date-btn">Tue, 13 May 2025</button>
        </div>

        <div className="card-grid">
          <div className="summary-card"><h4>Today’s Location</h4><h2>Office</h2><p>Bangalore</p></div>
          <div className="summary-card"><h4>Attendance Status</h4><h2>On Track</h2><p>All good</p></div>
          <div className="summary-card"><h4>Pending Requests</h4><h2>1</h2><p>View details</p></div>
          <div className="summary-card"><h4>This Week Attendance</h4><h2>80%</h2><p>4 / 5 Days Present</p></div>
        </div>

        <div className="content-grid">
          <section className="panel large">
            <h3>My Schedule <span>(This Week)</span></h3>
            <div className="week-grid">
              {["Mon\n12 May\nOffice", "Tue\n13 May\nOffice", "Wed\n14 May\nWork From Home", "Thu\n15 May\nOffice", "Fri\n16 May\nWork From Home", "Sat\n17 May\nClient Site", "Sun\n18 May\n-"].map((day) => (
                <div className="day-box" key={day}>
                  {day.split("\n").map((line) => <p key={line}>{line}</p>)}
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>Recent Notifications</h3>
            <p>Your alternate location request for 16 May is approved.</p>
            <p>Your work location for 13 May has been recorded successfully.</p>
            <p>Reminder: Please submit your work location for tomorrow.</p>
            <p>Team meeting scheduled on 15 May at 11:00 AM.</p>
          </section>

          <section className="panel large">
            <h3>Attendance Overview <span>(This Week)</span></h3>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <h2>80%</h2>
            <p>Overall</p>
          </section>

          <section className="panel">
            <h3>Quick Actions</h3>
            <button className="action-btn">Record Work Location</button>
            <button className="action-btn">New Alternate Request</button>
          </section>
        </div>
      </main>
    </div>
  );
}