import {
  CYCLE_LENGTH,
  FOCUS_MS,
  LONG_BREAK_MS,
  SHORT_BREAK_MS,
  type TimerKind,
  type TimerState,
} from "./types";

// Pure timer logic. Nothing here reads the clock, the DOM or storage:
// every function that depends on the time takes `now` (epoch ms) as an argument.

/** What `check` reports when a timer reaches its end. */
export interface CheckResult {
  state: TimerState;
  /** The kind of timer that just ended, or null if nothing ended. */
  finished: TimerKind | null;
  /** Set only when a focus session ended; this is what gets logged. */
  session: { endedAt: number } | null;
}

export function initialState(): TimerState {
  return {
    kind: "focus",
    status: "idle",
    endsAt: null,
    remainingMs: null,
    completedFocusCount: 0,
    label: "",
  };
}

export function durationFor(kind: TimerKind): number {
  if (kind === "focus") return FOCUS_MS;
  if (kind === "shortBreak") return SHORT_BREAK_MS;
  return LONG_BREAK_MS;
}

/** Milliseconds left: counted down from the end time, fixed while paused, full length when idle. */
export function remainingMs(state: TimerState, now: number): number {
  if (state.status === "running" && state.endsAt !== null) {
    return Math.max(0, state.endsAt - now);
  }
  if (state.status === "paused" && state.remainingMs !== null) {
    return state.remainingMs;
  }
  return durationFor(state.kind);
}

export function start(state: TimerState, now: number): TimerState {
  if (state.status !== "idle") return state;
  return { ...state, status: "running", endsAt: now + durationFor(state.kind), remainingMs: null };
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== "running" || state.endsAt === null) return state;
  return { ...state, status: "paused", endsAt: null, remainingMs: Math.max(0, state.endsAt - now) };
}

export function resume(state: TimerState, now: number): TimerState {
  if (state.status !== "paused" || state.remainingMs === null) return state;
  return { ...state, status: "running", endsAt: now + state.remainingMs, remainingMs: null };
}

/** Stops a running or paused timer. A cancelled focus session is not counted or logged. */
export function cancel(state: TimerState): TimerState {
  if (state.status === "idle") return state;
  // Cancelling the long break ends the cycle, so the count starts again.
  const count = state.kind === "longBreak" ? 0 : state.completedFocusCount;
  return { ...state, kind: "focus", status: "idle", endsAt: null, remainingMs: null, completedFocusCount: count };
}

/** Call on every tick and on page load. Completes the timer if its end time has passed. */
export function check(state: TimerState, now: number): CheckResult {
  const notFinished: CheckResult = { state, finished: null, session: null };
  if (state.status !== "running" || state.endsAt === null || now < state.endsAt) {
    return notFinished;
  }
  const endedAt = state.endsAt;
  const idle = { ...state, status: "idle" as const, endsAt: null, remainingMs: null };

  if (state.kind === "focus") {
    const count = state.completedFocusCount + 1;
    const next: TimerKind = count >= CYCLE_LENGTH ? "longBreak" : "shortBreak";
    return { state: { ...idle, kind: next, completedFocusCount: count }, finished: "focus", session: { endedAt } };
  }

  const count = state.kind === "longBreak" ? 0 : state.completedFocusCount;
  return { state: { ...idle, kind: "focus", completedFocusCount: count }, finished: state.kind, session: null };
}
