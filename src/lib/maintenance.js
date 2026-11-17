// Maintenance rules. Plain functions with no 3D and no Vue,
// so they are easy to read and easy to test.

const DAY_MS = 24 * 60 * 60 * 1000;

// How many days a service can be "due soon" before it is late.
export const DUE_SOON_DAYS = 30;

// Turn "2026-05-20" into a date at midnight UTC, so time zones never shift the day.
export function toDate(text) {
  return new Date(`${text}T00:00:00Z`);
}

// Format a date as "2026-05-20".
export function toText(date) {
  return date.toISOString().slice(0, 10);
}

// The date the next service is due.
export function nextServiceDate(item) {
  const last = toDate(item.lastService);
  return new Date(last.getTime() + item.intervalDays * DAY_MS);
}

// Days from today until the next service. Negative means it is late.
export function daysUntilService(item, today) {
  const todayMidnight = toDate(toText(today));
  return Math.round((nextServiceDate(item) - todayMidnight) / DAY_MS);
}

// "overdue", "soon" or "ok".
export function serviceStatus(item, today) {
  const days = daysUntilService(item, today);
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "soon";
  return "ok";
}

// Short text for the list, e.g. "12 days late", "due in 5 days", "due today".
export function describeDue(days) {
  if (days === 0) return "due today";
  if (days < 0) return `${-days} ${-days === 1 ? "day" : "days"} late`;
  return `due in ${days} ${days === 1 ? "day" : "days"}`;
}

// Most urgent first: the latest overdue item at the top.
export function sortByUrgency(items, today) {
  return [...items].sort((a, b) => daysUntilService(a, today) - daysUntilService(b, today));
}

// Count how many items have each status, for the summary at the top.
export function countByStatus(items, today) {
  const counts = { overdue: 0, soon: 0, ok: 0 };
  for (const item of items) counts[serviceStatus(item, today)] += 1;
  return counts;
}

// One colour per status, shared by the 3D view and the list.
export const statusColor = {
  overdue: "#f43f5e",
  soon: "#f59e0b",
  ok: "#10b981",
};

export const statusLabel = {
  overdue: "Overdue",
  soon: "Due soon",
  ok: "OK",
};
