# Research: Pomodoro Focus Log

No `NEEDS CLARIFICATION` items remained; the stack was specified. These are the decisions that
shape the design.

## Timer accuracy

- **Decision**: Store `endsAt` (epoch ms) while running and `remainingMs` while paused. Remaining
  time is `max(0, endsAt - now)`. A one-second interval only triggers re-rendering.
- **Rationale**: Browsers throttle background timers and sleeping computers stop them; counting
  ticks drifts. A stored end timestamp is always correct and survives a page reload.
- **Alternatives**: Counting ticks (drifts, rejected); Web Worker timer (extra code, still
  needs the timestamp, rejected).

## Completion while the app was closed or asleep

- **Decision**: On load and on every tick, call the timer's `check(now)`. If `endsAt <= now`, the
  session is completed. A focus session is logged with `completedAt = endsAt` (when it really
  ended) and the alert is shown immediately.
- **Rationale**: Meets the spec edge case; the log stays truthful.
- **Alternatives**: Discard sessions that ended while closed (loses valid work, rejected).

## Timer state model

- **Decision**: A plain object `{ kind, status, endsAt, remainingMs, completedFocusCount, label }`
  and pure functions `start`, `pause`, `resume`, `cancel`, `check` that return the new state
  (and a completed focus entry when one finishes).
- **Rationale**: Easy to read and test with fixed `now` values; no classes or state library.
- **Alternatives**: Class with an internal clock (needs fakes, rejected); state library (extra
  dependency, rejected).

## Four-session cycle

- **Decision**: `completedFocusCount` increments only when a focus session completes. When it
  reaches 4 the next kind is `longBreak`, otherwise `shortBreak`. The count resets to 0 when a
  long break ends or is cancelled. Cancelling a focus session leaves the count unchanged.
- **Rationale**: Matches FR-002 and FR-005 and the "session count resets afterward" scenario.

## Alerts

- **Decision**: On every end, play a short tone, show an in-page message (in an `aria-live`
  region), and change `document.title`. If `Notification.permission` is `granted`, also show a
  Web Notification. Permission is requested only when the person first starts a session (a user
  gesture). If denied or unsupported, the other alerts still run.
- **Tone**: Generated with the Web Audio API (a short oscillator beep), so no audio file or
  dependency is needed. The audio context is created on the first click to satisfy autoplay
  rules.
- **Alternatives**: Bundled audio file (extra asset, rejected); notification-only (fails when
  denied, rejected).
- **Spec note**: This amends the earlier clarification that said "no system notifications"; the
  spec now lists the notification as an extra when permission is granted.

## Storage

- **Decision**: Two `localStorage` keys, `pomodoro.timer.v1` and `pomodoro.log.v1`, JSON,
  validated on load. Corrupt or missing data falls back to an empty state instead of crashing.
  Writes are wrapped in try/catch so a full or blocked store shows a message rather than failing.
- **Rationale**: Simplest local store (Principle IV); versioned keys allow a future migration.

## Day boundaries and totals

- **Decision**: A day is a local calendar day. The 7 days are built by calendar-date arithmetic
  (`new Date(y, m, d - i)`), not by subtracting 24 hours, so daylight-saving changes do not
  skip or repeat a day.
- **Rationale**: Prevents wrong totals around clock changes (SC-004).

## Weekly bar chart

- **Decision**: One `<div>` per day with a height set as a percentage of the largest day's total,
  with the day label and a text duration under each bar.
- **Rationale**: No chart library; text values mean the chart does not rely on color alone.

## Export and delete

- **Decision**: CSV built in memory and downloaded through a temporary object URL (local only).
  Delete asks for confirmation, then clears the log.
- **Format**: `completed_at,duration_minutes,label` with ISO-8601 local time and RFC 4180
  quoting. Labels starting with `=`, `+`, `-` or `@` are prefixed with `'` to prevent
  spreadsheet formula injection.

## Tooling

- **Decision**: Vite for dev server and build, Vitest for tests (same config), TypeScript strict.
  No ESLint/Prettier at first; add only if a task needs them (Principle I).
