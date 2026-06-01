import { useEffect, useState } from "react";
import "../App.css";
import { getAttendanceSummary } from "../services/attendanceService";

const parseDateOnly = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatLongDate = (value) =>
  parseDateOnly(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });

const formatShortDate = (value) =>
  parseDateOnly(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const formatDayName = (value) =>
  parseDateOnly(value).toLocaleDateString(undefined, {
    timeZone: "UTC",
    weekday: "long",
  });

const formatWeekRange = (start, end) => {
  if (!start || !end) {
    return "Loading...";
  }

  const endDate = parseDateOnly(end);

  return `${formatShortDate(start)} - ${formatShortDate(end)}, ${endDate.getUTCFullYear()}`;
};

const formatRecordDateRange = (records) => {
  if (!records?.length) {
    return null;
  }

  const dates = records.map((record) => record.attendance_date).sort();
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  if (firstDate === lastDate) {
    return formatLongDate(firstDate);
  }

  return `${formatShortDate(firstDate)} - ${formatLongDate(lastDate)}`;
};

const displayAttendanceDate = (summary) =>
  formatRecordDateRange(summary?.records) ||
  formatWeekRange(summary?.week_start, summary?.week_end);

const displayLocation = (location) =>
  location === "Home" ? "Work From Home" : location || "-";

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

  const totalPresent = attendanceSummary?.total_present || 0;
  const totalAbsent = attendanceSummary?.total_absent || 0;
  const totalRecordedDays = totalPresent + totalAbsent;
  const attendanceRate = totalRecordedDays > 0
    ? Math.round((totalPresent / totalRecordedDays) * 100)
    : 0;

  return (
    <div className="dashboard-home">
      <div className="top-header">
        <div>
          <h1>Attendance</h1>
          <p>Track your attendance records and weekly progress.</p>
        </div>
        <button type="button">{displayAttendanceDate(attendanceSummary)}</button>
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
          <h2>
            {isLoading
              ? "Loading..."
              : `${attendanceSummary?.total_work_from_home || 0} Days`}
          </h2>
          <p>This week</p>
        </div>

        <div className="summary-card">
          <h4>Absent</h4>
          <h2>
            {isLoading
              ? "Loading..."
              : `${attendanceSummary?.total_absent || 0} Days`}
          </h2>
          <p>This week</p>
        </div>

        <div className="summary-card">
          <h4>Attendance Rate</h4>
          <h2>{isLoading ? "Loading..." : `${attendanceRate}%`}</h2>
          <p>
            {isLoading
              ? "This week"
              : `${totalPresent} / ${totalRecordedDays} recorded days`}
          </p>
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
            {isLoading ? (
              <tr>
                <td colSpan="4">Loading attendance records...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4">{error}</td>
              </tr>
            ) : attendanceSummary?.records?.length > 0 ? (
              attendanceSummary.records.map((record) => (
                <tr key={record.attendance_id}>
                  <td>{formatLongDate(record.attendance_date)}</td>
                  <td>{formatDayName(record.attendance_date)}</td>
                  <td>{displayLocation(record.actual_location)}</td>
                  <td>
                    <span className={`badge ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No attendance records found for this week.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
