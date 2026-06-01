const navigationItems = [
  {
    href: "#dashboard",
    icon: "home",
    label: "Dashboard",
    roles: ["employee", "manager", "admin"],
  },
  {
    href: "#my-schedule",
    icon: "calendar",
    label: "My Schedule",
    roles: ["employee", "manager", "admin"],
  },
  {
    href: "#work-location",
    icon: "location",
    label: "Work Location",
    roles: ["employee", "manager", "admin"],
  },
  {
    href: "#attendance",
    icon: "clock",
    label: "Attendance",
    roles: ["employee", "manager", "admin"],
  },
  {
    href: "#team",
    icon: "team",
    label: "Team Attendance",
    roles: ["manager", "admin"],
  },
  {
    href: "#reports",
    icon: "report",
    label: "Reports",
    roles: ["manager", "admin"],
  },
  {
    href: "#approvals",
    icon: "check",
    label: "Approvals",
    roles: ["manager", "admin"],
  },
  {
    href: "#employees",
    icon: "users",
    label: "Employees",
    roles: ["admin"],
  },
  {
    href: "#notifications",
    icon: "bell",
    label: "Notifications",
    roles: ["employee", "manager", "admin"],
    badgeKey: "notifications",
  },
  {
    href: "#profile",
    icon: "profile",
    label: "Profile",
    roles: ["employee", "manager", "admin"],
  },
];

const iconPaths = {
  bell: "M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2ZM9.5 21h5",
  calendar: "M7 3v4M17 3v4M4 9h16M5 5h14v15H5z",
  check: "m5 12 4 4L19 6",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  document: "M7 3h7l4 4v14H7zM14 3v5h5M9 13h6M9 17h6",
  home: "M3 11 12 4l9 7v9H5v-9Z",
  location: "M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  profile: "M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  report: "M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8",
  team: "M16 11a4 4 0 1 0-8 0M4 20a8 8 0 0 1 16 0M19 8a3 3 0 0 1 0 6M5 8a3 3 0 0 0 0 6",
  users: "M17 21a5 5 0 0 0-10 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21a4 4 0 0 0-3-3.87M17 5.13a4 4 0 0 1 0 5.74",
};

function NavIcon({ name }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  );
}

function SideNavigation({ activePage, notificationCount, onNavigate, onLogout, user }) {
  const role = user?.role || "employee";
  const visibleItems = navigationItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="side-navigation" aria-label="Primary navigation">
      <div className="nav-brand" aria-label="Team Attendance">
        <span className="nav-brand-mark" aria-hidden="true">
          TA
        </span>
      </div>

      <nav className="nav-menu">
        {visibleItems.map((item) => (
          <button
            className={activePage === item.href.slice(1) ? "nav-link active" : "nav-link"}
            key={item.href}
            onClick={() => onNavigate(item.href.slice(1))}
            type="button"
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
            {item.badgeKey === "notifications" && notificationCount > 0 && (
              <span className="nav-badge">{notificationCount}</span>
            )}
          </button>
        ))}
      </nav>

      <button className="logout-button" type="button" onClick={onLogout}>
        <NavIcon name="document" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default SideNavigation;
