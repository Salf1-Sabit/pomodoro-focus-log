# Quickstart: Validating the Pomodoro Focus Log

## Prerequisites

- Node.js 20 or later and npm
- A modern browser

## Setup and checks

```bash
npm install
npm test          # Vitest: timer transitions, four-session cycle, daily and weekly totals
npm run dev       # Vite dev server, open the printed local URL
npm run build     # Production build must succeed
```

## Automated checks (must pass before the feature is done)

- Timer transitions: start, pause, resume, cancel, complete for focus and both break types.
- Cycle: three short breaks then a long break on the fourth completion; count resets; a
  cancelled focus session does not advance the count.
- Completion after a long gap: `check` with a late `now` completes the session and logs
  `completedAt` as the original end time.
- Totals: today's total, zero-day handling, 7-day series ending today, a session near midnight,
  and a daylight-saving week.
- CSV: header, quoting, and formula-prefix escaping.

## Manual scenarios

1. **Cycle**: Start focus, pause, resume, let it finish; a 5-minute break is offered. The full
   four-session cycle with the 15-minute break is verified by the unit tests, which use a fixed
   clock. Manually, check only that the first session and break behave correctly. Starting a
   focus session takes at most 2 interactions from opening the app.
2. **Cancel**: Cancel a running session; nothing appears in Today.
3. **Label**: Type a label before and during a session (setting it takes under 10 seconds); typing past 60 characters shows a "Limited to 60 characters" note; it is saved on completion with no
   prompt.
4. **Persistence**: Reload mid-session; the countdown continues with correct time. Close the tab
   past the end time and reopen; the session is logged and the alert shows.
5. **Background accuracy**: Leave the tab in the background for a minute; the remaining time is
   still correct on return.
6. **Alerts**: Allow notifications and confirm tone, message, title and notification. Block
   notifications and confirm the other three still work. Mute sound and confirm the visible
   alerts.
7. **Today and 7 days**: Totals match the entries; empty days show zero.
8. **Keyboard**: Operate every control without a mouse; focus is always visible.
9. **Privacy**: In the browser network panel, confirm no requests are made after the page loads.
10. **Export and delete**: Export yields a valid CSV; Delete asks for confirmation and clears
    the log.
