const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : "";
}

export function formatTimeRange(start, end) {
  const startDate = toDate(start);
  if (!startDate) return "";
  const endDate = toDate(end);
  return endDate
    ? `${timeFormatter.format(startDate)} – ${timeFormatter.format(endDate)}`
    : timeFormatter.format(startDate);
}