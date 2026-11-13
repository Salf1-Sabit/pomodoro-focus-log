import { FOCUS_MS, MAX_LABEL_LENGTH, type LogEntry } from "./types";

// Pure functions for the focus log. Nothing here touches the DOM or storage.

/**
 * Builds the log entry for a focus session that ended at `completedAt`.
 * `existing` is only used to keep the id unique when two sessions share an end time.
 */
export function makeEntry(completedAt: number, label: string, existing: readonly LogEntry[] = []): LogEntry {
  const taken = new Set(existing.map((entry) => entry.id));
  let counter = 0;
  while (taken.has(`${completedAt}-${counter}`)) counter += 1;
  return {
    id: `${completedAt}-${counter}`,
    completedAt,
    durationMs: FOCUS_MS,
    label: label.trim().slice(0, MAX_LABEL_LENGTH),
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Local time as YYYY-MM-DDTHH:mm:ss. */
function formatLocalTime(epochMs: number): string {
  const d = new Date(epochMs);
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${date}T${time}`;
}

function csvLabel(label: string): string {
  // A leading = + - or @ can run as a formula when the file is opened in a spreadsheet.
  const safe = /^[=+\-@]/.test(label) ? `'${label}` : label;
  if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

/** One row per completed session, in the order given. */
export function toCsv(entries: readonly LogEntry[]): string {
  const rows = entries.map((entry) => {
    const minutes = Math.round(entry.durationMs / 60000);
    return `${formatLocalTime(entry.completedAt)},${minutes},${csvLabel(entry.label)}`;
  });
  return ["completed_at,duration_minutes,label", ...rows].join("\n") + "\n";
}

/** Local midnight at the start of the day that contains `epochMs`. */
function startOfDay(epochMs: number): number {
  const d = new Date(epochMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Entries completed on the local calendar day that contains `day`, in the order given. */
export function entriesForDay(entries: readonly LogEntry[], day: number): LogEntry[] {
  const start = startOfDay(day);
  const next = new Date(start);
  next.setDate(next.getDate() + 1);
  const end = next.getTime();
  return entries.filter((entry) => entry.completedAt >= start && entry.completedAt < end);
}

/** Total focused milliseconds on the local calendar day that contains `day`. */
export function dailyTotalMs(entries: readonly LogEntry[], day: number): number {
  return entriesForDay(entries, day).reduce((sum, entry) => sum + entry.durationMs, 0);
}

/** For example "25 min", "1 h 15 min", "2 h". */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export interface DayTotal {
  /** Local midnight at the start of the day. */
  dayStart: number;
  totalMs: number;
}

/** The last 7 local days, oldest first, ending with the day that contains `now`. */
export function lastSevenDays(entries: readonly LogEntry[], now: number): DayTotal[] {
  const today = new Date(now);
  const days: DayTotal[] = [];
  for (let back = 6; back >= 0; back--) {
    // Counting calendar dates (not subtracting 24 hours) keeps daylight-saving days correct.
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back).getTime();
    days.push({ dayStart, totalMs: dailyTotalMs(entries, dayStart) });
  }
  return days;
}
