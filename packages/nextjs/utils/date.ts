export const getRelativeTime = (timestamp: string | number | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  // Convert to appropriate unit
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffYears = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365));

  if (Math.abs(diffYears) >= 1) return rtf.format(-diffYears, "year");
  if (Math.abs(diffDays) >= 1) return rtf.format(-diffDays, "day");
  if (Math.abs(diffHours) >= 1) return rtf.format(-diffHours, "hour");
  return rtf.format(-diffMinutes, "minute");
};

export const formatDate = (timestamp: string | number | Date) => {
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date);
};
