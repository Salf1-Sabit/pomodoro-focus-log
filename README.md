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

## Colors

All colors live in one palette block at the top of `src/style.css` (light values, plus dark
values for people whose system uses a dark scheme). Every other rule uses `var(--token)`. Focus,
break, completed and cancelled each have their own color and also a non-color cue: a border
style or marker on the timer, a check mark on completed sessions, and the word "Cancelled."
`npm test` checks the contrast of the main pairs (4.5:1 for text, 3:1 for borders, focus ring
and markers) and fails if a color is written anywhere outside the palette.

## Project layout

- `src/timer.ts`: pure timer logic; takes the current time as an argument, no DOM
- `src/log.ts`: pure day and 7-day totals, CSV
- `src/storage.ts`: validated `localStorage` load and save
- `src/alerts.ts`: tone, notification and title alerts
- `src/main.ts`: connects the modules to the page
- `specs/001-pomodoro-focus-log/`: specification, plan, tasks and quickstart
