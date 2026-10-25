
const day = 86400000;
const at = (offsetDays, h, m = 0, durH = 3) => {
  const s = new Date(Date.now() + offsetDays * day);
  s.setHours(h, m, 0, 0);
  return { dateTime: s.toISOString(), endDateTime: new Date(s.getTime() + durH * 3600000).toISOString() };
};

export const demoEvents = [
  { id: 1, title: "Technology Workshop: Cloud Fundamentals", category: "Workshop", venueName: "Engineering Building, Lab 204", description: "Hands-on introduction to cloud computing, containers and deployment pipelines for beginners.", ...at(10, 10) },
  { id: 2, title: "Autumn Career Fair 2026", category: "Career", venueName: "Great Hall, Main Campus", description: "Meet over 80 employers recruiting graduates and interns across engineering, business and health.", ...at(18, 9, 0, 7) },
  { id: 3, title: "24-Hour Coding Hackathon", category: "Competition", venueName: "Computer Science Building, Atrium", description: "Teams of four build a working prototype overnight. Mentors, meals and prizes provided.", ...at(26, 8, 0, 24) },
  { id: 4, title: "Inter-Faculty Sports Day", category: "Sports", venueName: "University Sports Grounds", description: "Annual athletics, football and netball competition between all faculties. Spectators welcome.", ...at(33, 8, 30, 8.5) },
];

export const demoBookings = [
  { id: 1, bookingReference: "UV-10428", status: "REGISTERED", event: demoEvents[0] },
  { id: 2, bookingReference: "UV-10511", status: "WAITLISTED", event: demoEvents[2] },
  { id: 3, bookingReference: "UV-10233", status: "REGISTERED", event: { id: 5, title: "First-Year Student Orientation", ...at(41, 9, 0, 3.5) } },
  { id: 4, bookingReference: "UV-09001", status: "REGISTERED", event: { id: 6, title: "Study Skills Seminar", ...at(-12, 14, 0, 2) } },
];

export const demoNotifications = [
  { id: 1, type: "REGISTRATION_CONFIRMED", title: "Registration confirmed", message: "You are registered for Technology Workshop: Cloud Fundamentals.", read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 2, type: "VENUE_CHANGED", title: "Venue changed", message: "Coding Hackathon moves to the CS Building Atrium.", read: false, createdAt: new Date(Date.now() - 26 * 3600000).toISOString() },
  { id: 3, type: "REMINDER", title: "Reminder", message: "Autumn Career Fair starts in 3 days. Bring printed CVs.", read: true, createdAt: new Date(Date.now() - 50 * 3600000).toISOString() },
];

export const demoProfile = { faculty: "Engineering", participationPoints: 240 };
