const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function calendarTime(year, month, day) {
  const time = Date.UTC(year, month, day);
  const date = new Date(time);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day ? time : Infinity;
}

export function upcomingBirthTime(litter) {
  for (const value of [litter.birthDate, litter.expectedTiming, litter.delivery]) {
    const text = String(value || "").trim();
    const iso = text.match(/^(20\d{2})-(\d{2})-(\d{2})$/);
    if (iso) return calendarTime(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    const date = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:\s*[-–]\s*\d{1,2})?,?\s+(20\d{2})\b/i);
    if (date) return calendarTime(Number(date[3]), months.indexOf(date[1].toLowerCase()), Number(date[2]));
    const month = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
    if (month) return Date.UTC(Number(month[2]), months.indexOf(month[1].toLowerCase()), 1);
  }
  return Number.POSITIVE_INFINITY;
}

export function compareUpcomingLitters(first, second) {
  const a = upcomingBirthTime(first);
  const b = upcomingBirthTime(second);
  // Equal/unknown dates retain the source's stable order. Go-home is not birth.
  return a === b ? 0 : a - b;
}
