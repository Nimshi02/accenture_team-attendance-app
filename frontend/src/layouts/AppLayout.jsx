import SideNavigation from "../components/SideNavigation";

function AppLayout({
  activePage,
  children,
  notificationCount,
  onLogout,
  onNavigate,
  session,
}) {
  return (
    <div className="app-layout">
      <SideNavigation
        activePage={activePage}
        notificationCount={notificationCount}
        onLogout={onLogout}
        onNavigate={onNavigate}
        user={session.user}
      />
      <main className="app-content">{children}</main>
    </div>
  );
}

export default AppLayout;
