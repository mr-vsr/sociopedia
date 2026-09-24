const UNITS = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const timeAgo = (date) => {
  if (!date) return "";
  const secs = (new Date(date).getTime() - Date.now()) / 1000;
  if (Number.isNaN(secs)) return "";
  for (const [unit, s] of UNITS) {
    if (Math.abs(secs) >= s) return rtf.format(Math.round(secs / s), unit);
  }
  return "just now";
};

// Seed data stores comments as plain strings; new ones are objects.
export const normalizeComment = (c, i) =>
  typeof c === "string" ? { _id: `legacy-${i}`, text: c, name: "Guest", legacy: true } : c;
