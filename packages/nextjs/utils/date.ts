const getTimeDiff = (timestamp: string | number | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  return {
    diffMs,
    diffMinutes: Math.round(diffMs / (1000 * 60)),
    diffHours: Math.round(diffMs / (1000 * 60 * 60)),
    diffDays: Math.round(diffMs / (1000 * 60 * 60 * 24)),
    diffMonths: Math.round(diffMs / (1000 * 60 * 60 * 24 * 30)),
    diffYears: Math.round(diffMs / (1000 * 60 * 60 * 24 * 365)),
  };
};

// Returns the relative time for a future date in the format "1d 2h 3m"
export const getFutureRelativeTime = (timestamp: string | number | Date) => {
  const { diffMs, diffMinutes, diffHours, diffDays } = getTimeDiff(timestamp);

  if (diffMs < 0) return "";

  const parts = [];
  if (diffDays > 0) parts.push(`${diffDays}d`);
  if (diffHours > 0) parts.push(`${diffHours % 24}h`);
  if (diffMinutes > 0) parts.push(`${diffMinutes % 60}m`);

  return parts.join(" ");
};

// Returns the relative time for a past date in the format "1 year ago"
export const getPastRelativeTime = (timestamp: string | number | Date) => {
  const { diffYears, diffMonths, diffDays, diffHours, diffMinutes } = getTimeDiff(timestamp);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffYears) >= 1) return rtf.format(diffYears, "year");
  if (Math.abs(diffMonths) >= 1) return rtf.format(diffMonths, "month");
  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, "day");
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, "hour");

  return rtf.format(diffMinutes, "minute");
};

export const getRelativeTime = (timestamp: string | number | Date) => {
  const { diffMs } = getTimeDiff(timestamp);

  if (diffMs < 0) return getPastRelativeTime(timestamp);

  return getFutureRelativeTime(timestamp);
};

export const formatDate = (timestamp: string | number | Date) => {
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date);
};
