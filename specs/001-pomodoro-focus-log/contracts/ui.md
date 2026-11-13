# Contract: User Interface

One screen, three regions: Timer, Today, Last 7 days. Same wording and placement everywhere.

## Controls

| Control | Element | Shown when | Shortcut |
|---------|---------|-----------|----------|
| Start (focus or break, label names which) | `<button>` | idle | `Space` / `Enter` on focus; `S` |
| Pause | `<button>` | running | `P` |
| Resume | `<button>` | paused | `P` |
| Cancel | `<button>` | running or paused | `C` |
| Label | `<input type="text" maxlength="60">` with visible `<label>` | always | none |
| Export CSV | `<button>` | always | none |
| Delete log | `<button>` | always (asks for confirmation) | none |

Shortcuts are single keys that are ignored while the label field has focus. Every action is
also reachable with Tab and Enter/Space.

## Display

- Remaining time as `MM:SS`, plus the state in words ("Focus", "Short break", "Paused").
- Cycle progress in words, for example "Session 2 of 4".
- Today: list of completed sessions (time, label) and "Total focused: 1 h 15 min"; empty state
  text when none.
- Last 7 days: seven bars, each with the day name and its total as text.

## Accessibility

- Visible focus outline on every control; logical tab order; native elements only.
- A status region (`aria-live="polite"`) announces start, pause, resume, cancel and completion.
  The countdown itself is not announced every second.
- Text and controls meet WCAG AA contrast; state is never shown by color alone.
- Respects `prefers-color-scheme` and `prefers-reduced-motion`.

## Alerts on completion

1. Short tone.
2. Visible message ("Focus session complete" / "Break over").
3. `document.title` changes (for example `✔ Break over`) until the person interacts.
4. Web Notification if permission is granted. Permission is requested on the first Start click;
   denial leaves 1 to 3 working.
