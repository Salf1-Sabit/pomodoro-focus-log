import type { TimerState } from "./types";

// Placeholder so storage tests can import the default state; replaced fully in the timer task.
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
