const dateFmt = new Intl.DateTimeFormat("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit" });

// Backend sends ISO 8601; we only format, never guess a timezone.
export const formatDate = (iso) => (iso && !Number.isNaN(Date.parse(iso)) ? dateFmt.format(new Date(iso)) : "Date to be confirmed");
export const formatTime = (iso) => (iso && !Number.isNaN(Date.parse(iso)) ? timeFmt.format(new Date(iso)) : "");

export const formatTimeRange = (startIso, endIso) => {
  const start = formatTime(startIso);
  const end = formatTime(endIso);
  return start && end ? `${start} – ${end}` : start;
};

export function relativeTime(iso) {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return "";
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return formatDate(iso);
}
