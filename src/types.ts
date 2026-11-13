// Shared types and constants. Shapes match specs/001-pomodoro-focus-log/data-model.md.

export type TimerKind = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused";

export interface TimerState {
  /** What is running, or what starts next when idle. */
  kind: TimerKind;
  status: TimerStatus;
  /** Epoch ms when the timer ends. Set only while running. */
  endsAt: number | null;
  /** Milliseconds left. Set only while paused. */
  remainingMs: number | null;
  /** Completed focus sessions in the current cycle (0 to 4). */
  completedFocusCount: number;
  /** Optional label for the current focus session, at most MAX_LABEL_LENGTH characters. */
  label: string;
}

export interface LogEntry {
  id: string;
  /** Epoch ms when the session ended. */
  completedAt: number;
  durationMs: number;
  /** Empty when the person gave no label. */
  label: string;
}

export const FOCUS_MS = 25 * 60 * 1000;
export const SHORT_BREAK_MS = 5 * 60 * 1000;
export const LONG_BREAK_MS = 15 * 60 * 1000;
export const CYCLE_LENGTH = 4;
export const MAX_LABEL_LENGTH = 60;
