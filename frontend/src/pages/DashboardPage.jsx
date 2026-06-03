import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import {
  getAttendanceSummary,
  getTodayAttendance,
} from "../services/attendanceService";
import { getUnreadNotificationCount } from "../services/notificationService";
import { getSchedule } from "../services/scheduleService";
import Attendance from "./Attendance";
import MySchedulePage from "./MySchedulePage";
import NotificationsPage from "./NotificationsPage";
import ProfilePage from "./ProfilePage";
import WorkLocationPage from "./WorkLocationPage";

const dayLabels = {
  Friday: "Fri",
  Monday: "Mon",
  Saturday: "Sat",
  Sunday: "Sun",
  Thursday: "Thu",
  Tuesday: "Tue",
  Wednesday: "Wed",
};

const locationLabels = {
  Home: "Work From Home",
};

const baseSummaryCards = [
  {
    icon: "building",
    label: "Today's Location",
    value: "Loading...",
    detail: "From schedule",
  },
  {
    icon: "check",
    label: "Attendance Status",
    value: "Loading...",
    detail: "From attendance records",
  },
  {
    icon: "request",
    label: "Pending Requests",
    value: "1",
    detail: "View details",
  },
  {
    icon: "score",
    label: "This Week Attendance",
    value: "Loading...",
    detail: "From attendance records",
  },
];

const recentNotifications = [
  {
    title: "Your alternate location request for 16 May is approved.",
    time: "10:30 AM",
  },
  {
    title: "Your work location for 13 May has been recorded successfully.",
    time: "Yesterday",
  },
  {
    title: "Reminder: Please submit your work location for tomorrow.",
    time: "Yesterday",
  },
  {
    title: "Team meeting scheduled on 15 May at 11:00 AM.",
    time: "2 May",
  },
];

function ScheduleIcon({ location }) {
  if (location === "Office") {
    return (
      <svg
        className="schedule-icon office"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 21V5l9-2v18" />
        <path d="M14 8h5v13" />
        <path d="M8 9h2M8 13h2M8 17h2M17 12h1M17 16h1" />
      </svg>
    );
  }

  if (location === "Home" || location === "Work From Home") {
    return (
      <svg
        className="schedule-icon home"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6.5 10.5V21h11V10.5" />
        <path d="M10 21v-6h4v6" />
      </svg>
    );
  }

  if (location === "Client Site") {
    return (
      <svg
        className="schedule-icon client"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 21s6-4.8 6-10a6 6 0 0 0-12 0c0 5.2 6 10 6 10Z" />
        <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  return (
    <svg className="schedule-icon empty" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 12h8" />
    </svg>
  );
}

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const parseDateOnly = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatShortDate = (value) =>
  parseDateOnly(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const formatLongDate = (value) =>
  parseDateOnly(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
  });

const displayLocation = (location) =>
  locationLabels[location] || location || "-";

function DashboardPage({ onLogout, onSessionUpdate, session }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [dashboardSchedule, setDashboardSchedule] = useState(null);
  const [dashboardScheduleError, setDashboardScheduleError] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadNotificationCount = async () => {
      try {
        const count = await getUnreadNotificationCount(session.token);

        if (isMounted) {
          setNotificationCount(count);
        }
      } catch {
        if (isMounted) {
          setNotificationCount(0);
        }
      }
    };

    loadNotificationCount();

    return () => {
      isMounted = false;
    };
  }, [session.token]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [scheduleData, attendanceData, summaryData] = await Promise.all([
          getSchedule(session.token),
          getTodayAttendance(session.token),
          getAttendanceSummary(session.token),
        ]);

        if (isMounted) {
          setDashboardSchedule(scheduleData);
          setTodayAttendance(attendanceData);
          setAttendanceSummary(summaryData);
          setDashboardScheduleError("");
          const today = toDateInputValue(new Date());
          const selectedDate = scheduleData.days.some(
            (day) => day.date === today,
          )
            ? today
            : scheduleData.days[0]?.date;

          if (selectedDate) {
            setSelectedScheduleDate(selectedDate);
          }
        }
      } catch (requestError) {
        if (isMounted) {
          setDashboardSchedule(null);
          setAttendanceSummary(null);
          setTodayAttendance(null);
          setDashboardScheduleError(
            requestError.response?.data?.error ||
              "Could not load today's location",
          );
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [session.token]);

  const todayValue = toDateInputValue(new Date());
  const weeklySchedule =
    dashboardSchedule?.days.map((day) => ({
      day: dayLabels[day.day_name] || day.day_name.slice(0, 3),
      date: formatShortDate(day.date),
      fullDate: day.date,
      isToday: day.date === todayValue,
      location: day.planned_location,
      locationLabel: displayLocation(day.planned_location),
    })) || [];
  const todaySchedule = weeklySchedule.find((day) => day.isToday);
  const todayLocation =
    todayAttendance?.actual_location || todaySchedule?.location;
  const isDashboardDataLoaded = Boolean(dashboardSchedule && attendanceSummary);
  const scheduledDays = weeklySchedule.filter((day) => day.location).length;
  const totalPresent = attendanceSummary?.total_present || 0;
  const attendanceRate =
    scheduledDays > 0 ? Math.round((totalPresent / scheduledDays) * 100) : 0;
  const summaryCards = baseSummaryCards.map((card) => {
    if (card.label === "Today's Location") {
      return {
        ...card,
        value: dashboardScheduleError
          ? "Unavailable"
          : displayLocation(todayLocation),
        detail: todayAttendance
          ? `Submitted attendance: ${todayAttendance.status}`
          : todaySchedule
            ? `No attendance submitted yet - planned for ${formatLongDate(todaySchedule.fullDate)}`
            : dashboardScheduleError || "No schedule found",
      };
    }

    if (card.label === "Attendance Status") {
      return {
        ...card,
        value: dashboardScheduleError
          ? "Unavailable"
          : todayAttendance?.status || "Not Submitted",
        detail: todayAttendance
          ? `Actual location: ${displayLocation(todayAttendance.actual_location)}`
          : "No attendance record for today",
      };
    }

    if (card.label === "This Week Attendance") {
      return {
        ...card,
        value: !isDashboardDataLoaded
          ? "Loading..."
          : dashboardScheduleError
            ? "Unavailable"
            : `${attendanceRate}%`,
        detail: !isDashboardDataLoaded
          ? "From attendance records"
          : dashboardScheduleError
            ? dashboardScheduleError
            : `${totalPresent} / ${scheduledDays} Days`,
      };
    }

    return card;
  });

  const renderPage = () => {
    if (activePage === "attendance") {
      return <Attendance session={session} />;
    }

    if (activePage === "my-schedule") {
      return <MySchedulePage session={session} />;
    }

    if (activePage === "work-location") {
      return <WorkLocationPage session={session} />;
    }

    if (activePage === "notifications") {
      return (
        <NotificationsPage
          onUnreadCountChange={setNotificationCount}
          session={session}
        />
      );
    }

    if (activePage === "profile") {
      return (
        <ProfilePage onSessionUpdate={onSessionUpdate} session={session} />
      );
    }

    return renderDashboardHome();
  };

  const renderDashboardHome = () => (
    <div className="dashboard-home">
      <div className="dashboard-topbar">
        <div>
          <p className="dashboard-eyebrow">{session.user.role} dashboard</p>
          <h1>Hello, {session.user.full_name}</h1>
          <p>Here's your attendance and work location summary.</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="icon-alert-button"
            type="button"
            onClick={() => setActivePage("notifications")}
            aria-label="Open notifications"
          >
            !{notificationCount > 0 && <span>{notificationCount}</span>}
          </button>
          <button className="date-btn" type="button">
            <span>{formatLongDate(selectedScheduleDate)}</span>
            <svg className="date-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 3v3M17 3v3" />
              <path d="M4 8h16" />
              <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
          <div className="profile-menu">
            <button
              className="user-avatar"
              type="button"
              aria-label="Open profile menu"
            >
              {session.user.full_name.slice(0, 1)}
            </button>
            <div className="profile-menu-panel">
              <button onClick={() => setActivePage("profile")} type="button">
                My Profile
              </button>
              <button
                onClick={() => setActivePage("my-schedule")}
                type="button"
              >
                My Work Schedule
              </button>
              <button onClick={() => setActivePage("attendance")} type="button">
                Attendance
              </button>
              <button
                onClick={() => setActivePage("notifications")}
                type="button"
              >
                Notifications
              </button>
              <button onClick={onLogout} type="button">
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-grid">
        {summaryCards.map((card) => (
          <button
            className={`summary-card metric-${card.icon}`}
            key={card.label}
            onClick={() => {
              if (card.label === "Pending Requests") {
                setActivePage("requests");
              }
            }}
            type="button"
          >
            <h4>{card.label}</h4>
            {card.icon === "score" ? (
              <div className="metric-attendance">
                <div
                  className="mini-attendance-ring"
                  style={{ "--attendance-rate": `${attendanceRate}%` }}
                >
                  <strong>{card.value}</strong>
                </div>
                <p>
                  <strong>{card.detail}</strong>
                  <span>Present</span>
                </p>
              </div>
            ) : (
              <>
                <span className="metric-icon" aria-hidden="true" />
                <h2>{card.value}</h2>
                <p>{card.detail}</p>
              </>
            )}
          </button>
        ))}
      </div>

      <div className="content-grid">
        <section className="panel large">
          <div className="panel-heading">
            <h3>
              My Schedule <span>(This Week)</span>
            </h3>
            <button
              className="text-button"
              onClick={() => setActivePage("my-schedule")}
              type="button"
            >
              View Calendar
            </button>
          </div>
          <div className="week-grid">
            {weeklySchedule.length > 0 ? (
              weeklySchedule.map((schedule) => (
                <button
                  className={
                    schedule.fullDate === selectedScheduleDate
                      ? "day-box selected"
                      : "day-box"
                  }
                  key={`${schedule.day}-${schedule.fullDate}`}
                  onClick={() => setSelectedScheduleDate(schedule.fullDate)}
                  type="button"
                >
                  <ScheduleIcon location={schedule.location} />
                  <span>{schedule.day}</span>
                  <strong>{schedule.date}</strong>
                  <small>{schedule.locationLabel}</small>
                  {schedule.isToday && <em>Today</em>}
                </button>
              ))
            ) : (
              <p className="profile-status">
                {dashboardScheduleError || "Loading schedule..."}
              </p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h3>Recent Notifications</h3>
            <button
              className="text-button"
              type="button"
              onClick={() => setActivePage("notifications")}
            >
              View All
            </button>
          </div>
          <div className="compact-notification-list">
            {recentNotifications.map((notification) => (
              <button
                className="compact-notification"
                key={notification.title}
                onClick={() => setActivePage("notifications")}
                type="button"
              >
                <span aria-hidden="true" />
                <p>{notification.title}</p>
                <time>{notification.time}</time>
              </button>
            ))}
          </div>
        </section>

        <section className="panel large">
          <div className="panel-heading">
            <h3>
              Attendance Overview <span>(This Week)</span>
            </h3>
          </div>
          <div className="attendance-overview">
            <div>
              <div className="attendance-legend">
                <span className="present-dot" /> Present
                <span className="home-dot" /> Work from Home
                <span className="absent-dot" /> Absent
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
              <div className="attendance-stats">
                <span>{totalPresent} present</span>
                <span>{attendanceSummary?.total_absent || 0} absent</span>
              </div>
            </div>
            <div
              className="attendance-ring"
              aria-label={`${attendanceRate} percent attendance`}
              style={{ "--attendance-rate": `${attendanceRate}%` }}
            >
              <strong>{attendanceRate}%</strong>
              <span>Overall</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h3>Quick Actions</h3>
          </div>
          <button
            className="action-btn location-action"
            onClick={() => setActivePage("work-location")}
            type="button"
          >
            <span aria-hidden="true" />
            <div>
              <strong>Record Work Location</strong>
              <small>Submit today's work location</small>
            </div>
          </button>
          <button
            className="action-btn request-action"
            onClick={() => setActivePage("requests")}
            type="button"
          >
            <span aria-hidden="true" />
            <div>
              <strong>New Alternate Request</strong>
              <small>Request to work from alternate location</small>
            </div>
          </button>
        </section>
      </div>
    </div>
  );

  return (
    <AppLayout
      activePage={activePage}
      notificationCount={notificationCount}
      onLogout={onLogout}
      onNavigate={setActivePage}
      session={session}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default DashboardPage;
