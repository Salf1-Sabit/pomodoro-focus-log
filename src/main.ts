import { loadTimer, saveTimer } from "./storage";
import { cancel, check, pause, remainingMs, resume, start } from "./timer";
import { CYCLE_LENGTH, type TimerKind, type TimerState } from "./types";

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element #${id}`);
  return found as T;
}

const stateText = element("timer-state");
const display = element("timer-display");
const cycleText = element("timer-cycle");
const startButton = element<HTMLButtonElement>("start-button");
const pauseButton = element<HTMLButtonElement>("pause-button");
const resumeButton = element<HTMLButtonElement>("resume-button");
const cancelButton = element<HTMLButtonElement>("cancel-button");
const statusRegion = element("status");
const errorRegion = element("error");

let timer: TimerState = loadTimer(localStorage);

function announce(message: string): void {
  statusRegion.textContent = message;
}

/** Saves the timer; if the browser refuses, tells the person but keeps the timer running. */
function persist(): void {
  const ok = saveTimer(localStorage, timer);
  errorRegion.textContent = ok ? "" : "Could not save your data on this device.";
}

function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const KIND_NAMES: Record<TimerKind, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

function describeState(state: TimerState): string {
  const name = KIND_NAMES[state.kind];
  if (state.status === "paused") return `Paused: ${name}`;
  if (state.status === "running") return name;
  return state.kind === "focus" ? "Ready to focus" : `${name} ready`;
}

function describeCycle(state: TimerState): string {
  if (state.kind === "focus") {
    return `Session ${Math.min(state.completedFocusCount + 1, CYCLE_LENGTH)} of ${CYCLE_LENGTH}`;
  }
  return `${state.completedFocusCount} of ${CYCLE_LENGTH} sessions done`;
}

function render(): void {
  const now = Date.now();
  stateText.textContent = describeState(timer);
  display.textContent = formatClock(remainingMs(timer, now));
  cycleText.textContent = describeCycle(timer);
  startButton.textContent = `Start ${KIND_NAMES[timer.kind].toLowerCase()}`;
  startButton.hidden = timer.status !== "idle";
  pauseButton.hidden = timer.status !== "running";
  resumeButton.hidden = timer.status !== "paused";
  cancelButton.hidden = timer.status === "idle";
}

/** Runs on every tick and on page load: completes the timer if its end time has passed. */
function tick(): void {
  const result = check(timer, Date.now());
  if (result.finished !== null) {
    timer = result.state;
    persist();
    announce(result.finished === "focus" ? "Focus session complete." : "Break over.");
  }
  render();
}

function onStart(): void {
  timer = start(timer, Date.now());
  persist();
  announce(`${KIND_NAMES[timer.kind]} started.`);
  render();
}

function onPause(): void {
  timer = pause(timer, Date.now());
  persist();
  announce("Paused.");
  render();
}

function onResume(): void {
  timer = resume(timer, Date.now());
  persist();
  announce("Resumed.");
  render();
}

function onCancel(): void {
  timer = cancel(timer);
  persist();
  announce("Cancelled.");
  render();
}

startButton.addEventListener("click", onStart);
pauseButton.addEventListener("click", onPause);
resumeButton.addEventListener("click", onResume);
cancelButton.addEventListener("click", onCancel);

document.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement;
  const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
  if (typing || event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === "s" && timer.status === "idle") onStart();
  else if (key === "p" && timer.status === "running") onPause();
  else if (key === "p" && timer.status === "paused") onResume();
  else if (key === "c" && timer.status !== "idle") onCancel();
});

// Catch up at once when the tab becomes visible again after being in the background.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) tick();
});

tick();
setInterval(tick, 1000);
