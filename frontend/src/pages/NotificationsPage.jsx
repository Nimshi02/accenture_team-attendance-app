import { useEffect, useMemo, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
} from "../services/notificationService";

const tabs = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Requests", value: "requests" },
  { label: "System", value: "system" },
];

const typeLabels = {
  error: "Alert",
  info: "Info",
  success: "Done",
  system: "System",
  warning: "Reminder",
};

const formatNotificationTime = (value) => {
  const createdAt = new Date(value);
  const now = new Date();
  const diffMinutes = Math.max(1, Math.round((now - createdAt) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return createdAt.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
};

function NotificationsPage({ onUnreadCountChange, session }) {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getNotifications(session.token);

        if (isMounted) {
          setNotifications(data);
          onUnreadCountChange(data.filter((item) => !item.is_read).length);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.error || "Could not load notifications"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [onUnreadCountChange, session.token]);

  const visibleNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((notification) => !notification.is_read);
    }

    if (activeTab === "all") {
      return notifications;
    }

    return notifications.filter(
      (notification) => notification.category === activeTab
    );
  }, [activeTab, notifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(session.token);
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
      onUnreadCountChange(0);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not update notifications");
    }
  };

  return (
    <section className="notifications-page" aria-labelledby="notifications-title">
      <div className="page-heading">
        <div>
          <h1 id="notifications-title">Notifications</h1>
          <p>Review attendance, location, request, and system updates.</p>
        </div>
        <button className="text-button" type="button" onClick={handleMarkAllRead}>
          Mark all as read
        </button>
      </div>

      <div className="notification-tabs" role="tablist" aria-label="Notification filters">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.value ? "tab-button active" : "tab-button"}
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="notification-list">
        {isLoading ? (
          <p className="empty-notifications">Loading notifications...</p>
        ) : visibleNotifications.length === 0 ? (
          <p className="empty-notifications">No notifications to show.</p>
        ) : (
          visibleNotifications.map((notification) => (
            <article
              className={
                notification.is_read
                  ? "notification-item"
                  : "notification-item unread"
              }
              key={notification.notification_id}
            >
              <span className={`notification-icon ${notification.type}`} aria-hidden="true">
                {typeLabels[notification.type]?.slice(0, 1) || "N"}
              </span>

              <div className="notification-copy">
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
              </div>

              <time dateTime={notification.created_at}>
                {formatNotificationTime(notification.created_at)}
              </time>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default NotificationsPage;
