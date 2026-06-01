import { useEffect, useState } from "react";
import "../App.css";
import { getAttendanceSummary } from "../services/attendanceService";

export default function Attendance({ session }) {
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAttendanceSummary = async () => {
      setIsLoading(true);
      setError("");

      try {
        const summary = await getAttendanceSummary(session.token);

        if (isMounted) {
          setAttendanceSummary(summary);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.error || "Could not load attendance summary"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAttendanceSummary();

    return () => {
      isMounted = false;
    };
  }, [session.token]);

  return (
    <div className="dashboard-home">
        <div className="top-header">
          <div>
            <h1>Attendance</h1>
            <p>Track your attendance records and weekly progress.</p>
          </div>
          <button>May 2025</button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h4>Total Present</h4>
            <h2>
              {isLoading
                ? "Loading..."
                : `${attendanceSummary?.total_present || 0} Days`}
            </h2>
            <p>{error || "This week"}</p>
          </div>

          <div className="summary-card">
            <h4>Work From Home</h4>
            <h2>2 Days</h2>
            <p>This week</p>
          </div>

          <div className="summary-card">
            <h4>Absent</h4>
            <h2>1 Day</h2>
            <p>This week</p>
          </div>

          <div className="summary-card">
            <h4>Attendance Rate</h4>
            <h2>80%</h2>
            <p>Good progress</p>
          </div>
        </div>

        <section className="panel full">
          <h3>Weekly Attendance Records</h3>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Work Location</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>12 May 2025</td>
                <td>Monday</td>
                <td>Office</td>
                <td><span className="badge present">Present</span></td>
              </tr>
              <tr>
                <td>13 May 2025</td>
                <td>Tuesday</td>
                <td>Office</td>
                <td><span className="badge present">Present</span></td>
              </tr>
              <tr>
                <td>14 May 2025</td>
                <td>Wednesday</td>
                <td>Work From Home</td>
                <td><span className="badge present">Present</span></td>
              </tr>
              <tr>
                <td>15 May 2025</td>
                <td>Thursday</td>
                <td>Office</td>
                <td><span className="badge present">Present</span></td>
              </tr>
              <tr>
                <td>16 May 2025</td>
                <td>Friday</td>
                <td>Work From Home</td>
                <td><span className="badge absent">Absent</span></td>
              </tr>
            </tbody>
          </table>
        </section>
    </div>
  );
}
