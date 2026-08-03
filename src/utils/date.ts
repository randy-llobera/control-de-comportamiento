const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatDisplayDate(date: string): string {
  const match = ISO_DATE_PATTERN.exec(date);

  if (!match) return date;

  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}
