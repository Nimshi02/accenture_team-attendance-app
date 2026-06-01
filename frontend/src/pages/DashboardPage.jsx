import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { getUnreadNotificationCount } from "../services/notificationService";
import Attendance from "./Attendance";
import NotificationsPage from "./NotificationsPage";

const weeklySchedule = [
  { day: "Mon", date: "12 May", location: "Office" },
  { day: "Tue", date: "13 May", location: "Office", isToday: true },
  { day: "Wed", date: "14 May", location: "Work From Home" },
  { day: "Thu", date: "15 May", location: "Office" },
  { day: "Fri", date: "16 May", location: "Work From Home" },
  { day: "Sat", date: "17 May", location: "Client Site" },
  { day: "Sun", date: "18 May", location: "-" },
];

const summaryCards = [
  {
    icon: "building",
    label: "Today's Location",
    value: "Office",
    detail: "Bangalore",
  },
  {
    icon: "check",
    label: "Attendance Status",
    value: "On Track",
    detail: "All good",
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
    value: "80%",
    detail: "4 / 5 Days",
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
      <svg className="schedule-icon office" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 21V5l9-2v18" />
        <path d="M14 8h5v13" />
        <path d="M8 9h2M8 13h2M8 17h2M17 12h1M17 16h1" />
      </svg>
    );
  }

  if (location === "Work From Home") {
    return (
      <svg className="schedule-icon home" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6.5 10.5V21h11V10.5" />
        <path d="M10 21v-6h4v6" />
      </svg>
    );
  }

  if (location === "Client Site") {
    return (
      <svg className="schedule-icon client" viewBox="0 0 24 24" aria-hidden="true">
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

function DashboardPage({ session, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState("13 May");

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

  const renderPage = () => {
    if (activePage === "attendance") {
      return <Attendance />;
    }

    if (activePage === "notifications") {
      return (
        <NotificationsPage
          onUnreadCountChange={setNotificationCount}
          session={session}
        />
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
            !
            {notificationCount > 0 && <span>{notificationCount}</span>}
          </button>
          <button className="date-btn" type="button">
            <span>Tue, 13 May 2025</span>
            <span className="date-icon" aria-hidden="true" />
          </button>
          <span className="user-avatar" aria-hidden="true">
            {session.user.full_name.slice(0, 1)}
          </span>
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
                <div className="mini-attendance-ring">
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
            <button className="text-button" type="button">
              View Calendar
            </button>
          </div>
          <div className="week-grid">
            {weeklySchedule.map((schedule) => (
              <button
                className={
                  schedule.date === selectedScheduleDate
                    ? "day-box selected"
                    : "day-box"
                }
                key={`${schedule.day}-${schedule.date}`}
                onClick={() => setSelectedScheduleDate(schedule.date)}
                type="button"
              >
                <ScheduleIcon location={schedule.location} />
                <span>{schedule.day}</span>
                <strong>{schedule.date}</strong>
                <small>{schedule.location}</small>
                {schedule.isToday && <em>Today</em>}
              </button>
            ))}
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
                <div className="progress-fill" />
              </div>
              <div className="attendance-stats">
                <span>4 present</span>
                <span>1 absent</span>
              </div>
            </div>
            <div className="attendance-ring" aria-label="80 percent attendance">
              <strong>80%</strong>
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
