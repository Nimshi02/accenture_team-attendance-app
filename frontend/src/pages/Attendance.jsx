import { useEffect, useState } from "react";
import "../App.css";
import {
  getAttendanceSummary,
  recordAttendance,
} from "../services/attendanceService";
import { getSchedule } from "../services/scheduleService";

const locationOptions = ["Office", "Home", "Client Site"];

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

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
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    actual_location: "Office",
    attendance_date: toDateInputValue(new Date()),
    status: "Present",
  });
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAttendanceSummary = async () => {
      setIsLoading(true);
      setError("");

      try {
        const today = toDateInputValue(new Date());
        const [summary, scheduleData] = await Promise.all([
          getAttendanceSummary(session.token, today),
          getSchedule(session.token, today),
        ]);

        if (isMounted) {
          setAttendanceSummary(summary);
          setSchedule(scheduleData);

          const todaySchedule = scheduleData.days.find((day) => day.date === today);
          setFormData((currentFormData) => ({
            ...currentFormData,
            actual_location: todaySchedule?.planned_location || "Office",
          }));
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

  const refreshAttendanceSummary = async () => {
    const summary = await getAttendanceSummary(session.token, formData.attendance_date);
    setAttendanceSummary(summary);
  };

  const selectedSchedule = schedule?.days.find(
    (day) => day.date === formData.attendance_date
  );
  const existingRecord = attendanceSummary?.records?.find(
    (record) => record.attendance_date === formData.attendance_date
  );
  const plannedLocation = selectedSchedule?.planned_location || "Office";

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
    setFormMessage("");
  };

  const handleDateChange = (event) => {
    const nextDate = event.target.value;
    const nextSchedule = schedule?.days.find((day) => day.date === nextDate);

    setFormData((currentFormData) => ({
      ...currentFormData,
      attendance_date: nextDate,
      actual_location: nextSchedule?.planned_location || currentFormData.actual_location,
    }));
    setFormMessage("");
  };

  const handleAttendanceSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setFormMessage("");

    try {
      const response = await recordAttendance(session.token, formData);
      await refreshAttendanceSummary();
      setFormMessage(response.message || "Attendance recorded successfully");
    } catch (requestError) {
      setFormMessage(
        requestError.response?.data?.error || "Could not record attendance"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <section className="panel attendance-entry-panel">
        <div className="panel-heading">
          <div>
            <h3>Record Attendance</h3>
            <p>
              Planned location: <strong>{displayLocation(plannedLocation)}</strong>
            </p>
          </div>
          {existingRecord && (
            <span className={`badge ${existingRecord.status.toLowerCase()}`}>
              {existingRecord.status} recorded
            </span>
          )}
        </div>

        <form className="attendance-entry-form" onSubmit={handleAttendanceSubmit}>
          <label className="profile-form-field">
            <span>Date</span>
            <input
              name="attendance_date"
              onChange={handleDateChange}
              type="date"
              value={formData.attendance_date}
            />
          </label>

          <label className="profile-form-field">
            <span>Actual Work Location</span>
            <select
              name="actual_location"
              onChange={handleFormChange}
              value={formData.actual_location}
            >
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {displayLocation(location)}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-form-field">
            <span>Status</span>
            <select
              name="status"
              onChange={handleFormChange}
              value={formData.status}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Saving..."
              : existingRecord
              ? "Update Attendance"
              : "Submit Attendance"}
          </button>
        </form>

        {formMessage && <p className="form-status">{formMessage}</p>}
      </section>

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
