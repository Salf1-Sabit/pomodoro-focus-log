import { initialState } from "./timer";
import { MAX_LABEL_LENGTH, type LogEntry, type TimerState } from "./types";

// The storage keys are versioned so a future format change can migrate old data.
const TIMER_KEY = "pomodoro.timer.v1";
const LOG_KEY = "pomodoro.log.v1";

/** The two Storage methods we use, so tests can pass a plain object. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function readJson(storage: StorageLike, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(storage: StorageLike, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function parseTimer(value: unknown): TimerState | null {
  if (!isRecord(value)) return null;
  const { kind, status, endsAt, remainingMs, completedFocusCount, label } = value;
  const kindOk = kind === "focus" || kind === "shortBreak" || kind === "longBreak";
  const statusOk = status === "idle" || status === "running" || status === "paused";
  const countOk =
    typeof completedFocusCount === "number" &&
    Number.isInteger(completedFocusCount) &&
    completedFocusCount >= 0 &&
    completedFocusCount <= 4;
  if (!kindOk || !statusOk || !countOk) return null;
  if (!isNumberOrNull(endsAt) || !isNumberOrNull(remainingMs)) return null;
  if (typeof label !== "string") return null;
  // A running timer needs an end time and a paused one needs the time left.
  if (status === "running" && endsAt === null) return null;
  if (status === "paused" && remainingMs === null) return null;
  return {
    kind,
    status,
    endsAt,
    remainingMs,
    completedFocusCount,
    label: label.slice(0, MAX_LABEL_LENGTH),
  };
}

function parseEntry(value: unknown): LogEntry | null {
  if (!isRecord(value)) return null;
  const { id, completedAt, durationMs, label } = value;
  if (typeof id !== "string" || id === "") return null;
  if (typeof completedAt !== "number" || !Number.isFinite(completedAt)) return null;
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs <= 0) return null;
  if (typeof label !== "string" || label.length > MAX_LABEL_LENGTH) return null;
  return { id, completedAt, durationMs, label };
}

export function loadTimer(storage: StorageLike): TimerState {
  return parseTimer(readJson(storage, TIMER_KEY)) ?? initialState();
}

/** Returns false when the browser refused the write (full, blocked, private mode). */
export function saveTimer(storage: StorageLike, state: TimerState): boolean {
  return writeJson(storage, TIMER_KEY, state);
}

export function loadLog(storage: StorageLike): LogEntry[] {
  const value = readJson(storage, LOG_KEY);
  if (!Array.isArray(value)) return [];
  const entries: LogEntry[] = [];
  for (const item of value) {
    const entry = parseEntry(item);
    if (entry) entries.push(entry);
  }
  return entries;
}

/** Returns false when the browser refused the write. */
export function saveLog(storage: StorageLike, entries: LogEntry[]): boolean {
  return writeJson(storage, LOG_KEY, entries);
}
