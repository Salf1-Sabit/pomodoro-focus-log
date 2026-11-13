import { describe, expect, it } from "vitest";
import {
  cancel,
  check,
  durationFor,
  initialState,
  pause,
  remainingMs,
  resume,
  start,
} from "../../src/timer";
import { FOCUS_MS, LONG_BREAK_MS, SHORT_BREAK_MS, type TimerState } from "../../src/types";

const T0 = 1_700_000_000_000;

/** Runs one full focus session from idle and returns the state after it completes. */
function completeFocus(state: TimerState, now: number): { state: TimerState; now: number } {
  const running = start(state, now);
  const end = running.endsAt as number;
  return { state: check(running, end).state, now: end };
}

describe("start, pause, resume", () => {
  it("starts a 25 minute focus session", () => {
    const s = start(initialState(), T0);
    expect(s.status).toBe("running");
    expect(s.kind).toBe("focus");
    expect(s.endsAt).toBe(T0 + FOCUS_MS);
    expect(s.remainingMs).toBeNull();
  });

  it("pause stores the remaining time and clears the end time", () => {
    const running = start(initialState(), T0);
    const paused = pause(running, T0 + 60_000);
    expect(paused.status).toBe("paused");
    expect(paused.remainingMs).toBe(FOCUS_MS - 60_000);
    expect(paused.endsAt).toBeNull();
  });

  it("resume sets a new end time from the stored remaining time", () => {
    const paused = pause(start(initialState(), T0), T0 + 60_000);
    const resumed = resume(paused, T0 + 600_000);
    expect(resumed.status).toBe("running");
    expect(resumed.endsAt).toBe(T0 + 600_000 + FOCUS_MS - 60_000);
    expect(resumed.remainingMs).toBeNull();
  });

  it("time spent paused does not count against the session", () => {
    const paused = pause(start(initialState(), T0), T0 + 10_000);
    expect(remainingMs(paused, T0 + 9_999_999)).toBe(FOCUS_MS - 10_000);
  });

  it("returns the state unchanged for actions that do not apply", () => {
    const idle = initialState();
    const running = start(idle, T0);
    const paused = pause(running, T0 + 1000);
    expect(pause(idle, T0)).toEqual(idle);
    expect(resume(idle, T0)).toEqual(idle);
    expect(resume(running, T0)).toEqual(running);
    expect(start(running, T0 + 5)).toEqual(running);
    expect(start(paused, T0 + 5)).toEqual(paused);
    expect(pause(paused, T0 + 5)).toEqual(paused);
  });
});

describe("cancel", () => {
  it("cancelling a running focus session returns to idle focus and does not count", () => {
    const s = cancel(start(initialState(), T0));
    expect(s.status).toBe("idle");
    expect(s.kind).toBe("focus");
    expect(s.endsAt).toBeNull();
    expect(s.completedFocusCount).toBe(0);
  });

  it("cancelling a paused focus session returns to idle focus", () => {
    const s = cancel(pause(start(initialState(), T0), T0 + 1000));
    expect(s.status).toBe("idle");
    expect(s.remainingMs).toBeNull();
  });

  it("cancelling mid-cycle leaves the completed count unchanged", () => {
    const first = completeFocus(initialState(), T0);
    expect(first.state.completedFocusCount).toBe(1);
    // Break completes, then a new focus session is started and cancelled.
    const afterBreak = check(start(first.state, first.now), first.now + SHORT_BREAK_MS).state;
    const cancelled = cancel(start(afterBreak, first.now + SHORT_BREAK_MS));
    expect(cancelled.completedFocusCount).toBe(1);
  });

  it("cancelling a short break returns to idle focus and keeps the count", () => {
    const first = completeFocus(initialState(), T0);
    const s = cancel(start(first.state, first.now));
    expect(s.kind).toBe("focus");
    expect(s.status).toBe("idle");
    expect(s.completedFocusCount).toBe(1);
  });

  it("cancel while idle changes nothing", () => {
    const idle = initialState();
    expect(cancel(idle)).toEqual(idle);
  });
});

describe("completion", () => {
  it("does nothing before the end time", () => {
    const running = start(initialState(), T0);
    const result = check(running, T0 + FOCUS_MS - 1);
    expect(result.state).toEqual(running);
    expect(result.finished).toBeNull();
    expect(result.session).toBeNull();
  });

  it("does nothing while paused or idle", () => {
    const paused = pause(start(initialState(), T0), T0 + 1000);
    expect(check(paused, T0 + 10 * FOCUS_MS).finished).toBeNull();
    expect(check(initialState(), T0).finished).toBeNull();
  });

  it("completes a focus session at the end time and counts it", () => {
    const running = start(initialState(), T0);
    const result = check(running, T0 + FOCUS_MS);
    expect(result.finished).toBe("focus");
    expect(result.session).not.toBeNull();
    expect(result.state.status).toBe("idle");
    expect(result.state.endsAt).toBeNull();
    expect(result.state.completedFocusCount).toBe(1);
  });

  it("completing a break returns to idle focus without a session", () => {
    const first = completeFocus(initialState(), T0);
    const breakRunning = start(first.state, first.now);
    const result = check(breakRunning, first.now + SHORT_BREAK_MS);
    expect(result.finished).toBe("shortBreak");
    expect(result.session).toBeNull();
    expect(result.state.kind).toBe("focus");
    expect(result.state.status).toBe("idle");
  });
});

describe("four-session cycle", () => {
  it("offers a short break after sessions 1 to 3 and a long break after session 4", () => {
    let state = initialState();
    let now = T0;
    const offered: string[] = [];
    for (let i = 0; i < 4; i++) {
      const done = completeFocus(state, now);
      offered.push(done.state.kind);
      expect(done.state.completedFocusCount).toBe(i + 1);
      // Take the break to its end so the next focus session can start.
      const breakRunning = start(done.state, done.now);
      state = check(breakRunning, breakRunning.endsAt as number).state;
      now = breakRunning.endsAt as number;
    }
    expect(offered).toEqual(["shortBreak", "shortBreak", "shortBreak", "longBreak"]);
  });

  it("uses 5 minutes for short breaks and 15 minutes for the long break", () => {
    expect(durationFor("focus")).toBe(FOCUS_MS);
    expect(durationFor("shortBreak")).toBe(SHORT_BREAK_MS);
    expect(durationFor("longBreak")).toBe(LONG_BREAK_MS);
    const state: TimerState = { ...initialState(), kind: "longBreak", completedFocusCount: 4 };
    expect(start(state, T0).endsAt).toBe(T0 + LONG_BREAK_MS);
  });

  it("resets the count after the long break completes", () => {
    const longOffered: TimerState = { ...initialState(), kind: "longBreak", completedFocusCount: 4 };
    const result = check(start(longOffered, T0), T0 + LONG_BREAK_MS);
    expect(result.state.completedFocusCount).toBe(0);
    expect(result.state.kind).toBe("focus");
  });

  it("resets the count when the long break is cancelled", () => {
    const longOffered: TimerState = { ...initialState(), kind: "longBreak", completedFocusCount: 4 };
    const s = cancel(start(longOffered, T0));
    expect(s.completedFocusCount).toBe(0);
    expect(s.kind).toBe("focus");
    expect(s.status).toBe("idle");
  });
});

describe("time accuracy", () => {
  it("remaining time is the end time minus now while running", () => {
    const running = start(initialState(), T0);
    expect(remainingMs(running, T0)).toBe(FOCUS_MS);
    expect(remainingMs(running, T0 + 90_000)).toBe(FOCUS_MS - 90_000);
  });

  it("remaining time never goes below zero", () => {
    expect(remainingMs(start(initialState(), T0), T0 + 2 * FOCUS_MS)).toBe(0);
  });

  it("remaining time for an idle timer is the full duration of the next kind", () => {
    expect(remainingMs(initialState(), T0)).toBe(FOCUS_MS);
  });

  it("a late check after sleep completes the session and reports the original end time", () => {
    const running = start(initialState(), T0);
    const result = check(running, T0 + FOCUS_MS + 3 * 60 * 60 * 1000);
    expect(result.finished).toBe("focus");
    expect(result.session?.endedAt).toBe(T0 + FOCUS_MS);
  });
});
