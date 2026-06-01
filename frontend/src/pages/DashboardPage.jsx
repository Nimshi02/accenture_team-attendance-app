import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { getUnreadNotificationCount } from "../services/notificationService";
import NotificationsPage from "./NotificationsPage";

function DashboardPage({ session, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [notificationCount, setNotificationCount] = useState(0);

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
    if (activePage === "notifications") {
      return (
        <NotificationsPage
          onUnreadCountChange={setNotificationCount}
          session={session}
        />
      );
    }

    return (
      <section className="dashboard-header" aria-labelledby="dashboard-title">
        <p className="dashboard-eyebrow">{session.user.role}</p>
        <h1 id="dashboard-title">Welcome back, {session.user.full_name}</h1>
        <p className="muted-copy">
          You are signed in. Your role is attached to your account automatically.
        </p>
      </section>
    );
  };

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
