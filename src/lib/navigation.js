// Navigation lives here, not inside pages (FE 50). Pages never copy these links.
export const NAV_BY_ROLE = {
  STUDENT: [
    { to: "/student", label: "Home", end: true },
    { to: "/student/events", label: "Events" },
    { to: "/student/my-events", label: "My Events" },
    { to: "/student/notifications", label: "Notifications" },
    { to: "/student/profile", label: "Profile" },
  ],
  ORGANIZER: [
    { to: "/organizer", label: "My Events", end: true },
    { to: "/organizer/events/create", label: "Create Event" },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/events", label: "Events" },
    { to: "/admin/users", label: "Users" },
  ],
};

// Only students have a notifications screen at the moment.
export const NOTIFICATIONS_PATH_BY_ROLE = { STUDENT: "/student/notifications" };

export const ROLE_LABELS = { STUDENT: "Student", ORGANIZER: "Organizer", ADMIN: "Administrator" };