# Contract: Local Storage and Export

The app has no network interface. Its external surfaces are browser storage and a downloaded
file.

## localStorage keys

| Key | Value |
|-----|-------|
| `pomodoro.timer.v1` | JSON `TimerState` (see [data-model.md](../data-model.md)) |
| `pomodoro.log.v1` | JSON array of `LogEntry`, oldest first |

Rules:
- Missing, unparsable or wrongly shaped values MUST load as the default (idle focus timer, empty
  log) without throwing.
- Invalid entries in the log array are dropped; valid ones are kept.
- No other keys are written. Nothing is sent over the network.

## CSV export

File name: `focus-log-YYYY-MM-DD.csv` (date of export, local).

Header: `completed_at,duration_minutes,label`

One row per entry, oldest first:
- `completed_at`: local time as `YYYY-MM-DDTHH:mm:ss`
- `duration_minutes`: integer
- `label`: double-quoted when it contains a comma, quote or newline (quotes doubled); a leading
  `=`, `+`, `-` or `@` is prefixed with `'`

An empty log exports the header row only.
