import type { TimerKind } from "./types";

// End-of-timer alerts: a tone, a message, a changed page title, and a system notification
// when the person has allowed them. Each part is independent, so if one is blocked
// or unsupported the others still work.

export interface AlertContent {
  message: string;
  title: string;
}

/** The words shown for a timer that just ended. Both break types read the same. */
export function alertContent(ended: TimerKind): AlertContent {
  if (ended === "focus") {
    return { message: "Focus session complete. Time for a break.", title: "✔ Focus complete" };
  }
  return { message: "Break over. Ready for the next focus session.", title: "✔ Break over" };
}

/** A system notification is shown only when the browser supports it and the person allowed it. */
export function shouldNotify(permission: string | undefined, supported: boolean): boolean {
  return supported && permission === "granted";
}

let audio: AudioContext | null = null;
let normalTitle: string | null = null;

/**
 * Call from a click or key press (browsers only allow sound and permission prompts after one).
 * Prepares the audio and asks for notification permission once; refusal is fine.
 */
export function prepareAlerts(): void {
  try {
    audio ??= new AudioContext();
    void audio.resume();
  } catch {
    audio = null;
  }
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  } catch {
    // Permission prompts are not available here; the other alerts still work.
  }
}

/** Two short beeps, generated in the browser so no audio file is needed. */
export function playTone(): void {
  if (!audio) return;
  try {
    const context = audio;
    for (const offset of [0, 0.25]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = context.currentTime + offset;
      oscillator.frequency.value = 880;
      // Fade in and out so the beep does not click.
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(0.2, startAt + 0.02);
      gain.gain.linearRampToValueAtTime(0, startAt + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.2);
    }
  } catch {
    // Sound is unavailable; the visible alerts still show.
  }
}

export function notify(message: string): void {
  try {
    const supported = typeof Notification !== "undefined";
    if (shouldNotify(supported ? Notification.permission : undefined, supported)) {
      new Notification("Pomodoro Focus Log", { body: message });
    }
  } catch {
    // Some browsers refuse the Notification constructor; ignore.
  }
}

export function setAlertTitle(title: string): void {
  normalTitle ??= document.title;
  document.title = title;
}

/** Puts the normal page title back after an alert, if one was shown. */
export function restoreTitle(): void {
  if (normalTitle !== null) {
    document.title = normalTitle;
    normalTitle = null;
  }
}
