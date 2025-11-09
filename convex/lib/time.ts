const ISO_LENGTH = 10;

export const now = () => Date.now();

export function toISODate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, ISO_LENGTH);
}

export function getLocalDate(timestamp: number, timezone: string): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(timestamp);
    const year = parts.find((p) => p.type === "year")?.value ?? "0000";
    const month = parts.find((p) => p.type === "month")?.value ?? "01";
    const day = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${year}-${month}-${day}`;
  } catch {
    // Fallback to UTC if timezone is invalid/missing.
    return toISODate(timestamp);
  }
}

export function ensureDateRange(
  from?: string,
  to?: string,
): { from: string; to: string } {
  const nowTs = now();
  const today = toISODate(nowTs);
  const start = from ?? today;
  const end = to ?? today;

  if (start > end) {
    throw new Error("Invalid date range: from is after to");
  }

  return { from: start, to: end };
}
