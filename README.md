# Pomodoro Focus Log

A small personal Pomodoro timer with a focus log. It runs entirely in the browser.

- 25-minute focus sessions, 5-minute breaks, and a 15-minute break after every fourth session.
- Pause, resume or cancel at any time. Shortcuts: `S` start, `P` pause or resume, `C` cancel.
- Each completed focus session is saved with an optional label.
- See today's sessions and total, plus a bar chart of the last 7 days.
- A tone, a message, a page-title change and (if allowed) a system notification when a timer ends.
- Export the log as CSV, or delete it.

## Privacy

All data stays in this browser's `localStorage`. There is no backend, no account, no analytics and
no network request after the page loads.

## Run, test, build

Requires Node.js 18 or later.

```bash
npm install
npm run dev      # start the dev server
npm test         # unit tests (timer logic, log totals, storage, alerts)
npm run build    # type-check and build to dist/
```

## Project layout

- `src/timer.ts`: pure timer logic; takes the current time as an argument, no DOM
- `src/log.ts`: pure day and 7-day totals, CSV
- `src/storage.ts`: validated `localStorage` load and save
- `src/alerts.ts`: tone, notification and title alerts
- `src/main.ts`: connects the modules to the page
- `specs/001-pomodoro-focus-log/`: specification, plan, tasks and quickstart
