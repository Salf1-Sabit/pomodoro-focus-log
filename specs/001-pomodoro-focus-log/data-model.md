# Data Model: Pomodoro Focus Log

## TimerState (persisted as `pomodoro.timer.v1`)

| Field | Type | Notes |
|-------|------|-------|
| `kind` | `"focus" \| "shortBreak" \| "longBreak"` | What is running, or what starts next when idle |
| `status` | `"idle" \| "running" \| "paused"` | |
| `endsAt` | `number \| null` | Epoch ms; set only while `running` |
| `remainingMs` | `number \| null` | Set only while `paused` |
| `completedFocusCount` | `0..4` | Completed focus sessions in the current cycle |
| `label` | `string` | Current optional label, max 60 characters |

### Durations

Focus 25 min, short break 5 min, long break 15 min (fixed constants in `timer.ts`).

### Transitions

| From | Action | To |
|------|--------|----|
| idle (kind K) | `start(now)` | running, `endsAt = now + duration(K)` |
| running | `pause(now)` | paused, `remainingMs = endsAt - now`, `endsAt = null` |
| paused | `resume(now)` | running, `endsAt = now + remainingMs` |
| running or paused, kind focus | `cancel` | idle, kind focus, count unchanged, no log entry |
| running or paused, break | `cancel` | idle, kind focus; count reset if it was a long break |
| running focus | `check(now)` with `now >= endsAt` | idle, count + 1, kind = `longBreak` if count is 4 else `shortBreak`; returns a LogEntry |
| running break | `check(now)` with `now >= endsAt` | idle, kind focus; count reset if it was a long break |

Invalid actions (for example `pause` while idle) return the state unchanged.

## LogEntry (persisted in `pomodoro.log.v1` as an array)

| Field | Type | Rules |
|-------|------|-------|
| `id` | `string` | Unique; derived from `completedAt` plus a counter |
| `completedAt` | `number` | Epoch ms when the session ended (the `endsAt` value, not the time it was noticed) |
| `durationMs` | `number` | Always 25 minutes in this version |
| `label` | `string` | Empty if none; trimmed; max 60 characters |

Only completed focus sessions are stored. Breaks and cancelled sessions are never logged.

## DailyTotal (derived, never stored)

| Field | Type | Notes |
|-------|------|-------|
| `dayStart` | `number` | Epoch ms of local midnight |
| `totalMs` | `number` | Sum of `durationMs` for entries whose `completedAt` falls in that local day |

"Today" is one DailyTotal plus the entries list for that day. The weekly summary is seven
DailyTotals, oldest first, ending today, including zero days.
