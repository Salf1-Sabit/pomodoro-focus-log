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

## Verification results (2026-11-13)

- `npm test`: 70 unit tests pass (timer, cycle, log totals, 7-day series including both
  daylight-saving changes, CSV, storage, alert text). `npm run build` succeeds.
- Scenarios 1 to 10 were run against the built app in headless Chrome driven over the DevTools
  protocol (35 checks, all passing), with screenshots reviewed in light and dark themes at phone
  and desktop widths.
- Scenario 5 (background accuracy) was checked by moving the page clock forward rather than by
  waiting in a real background tab; the timer is derived from the stored end time, which is what
  makes it independent of tick timing.
- Scenario 6 was checked for tone, message, title and notification with permission granted and
  denied by observing the browser calls. Whether the tone is audible and how the operating
  system presents the notification still need a person to confirm on a real device.
- Contrast ratios were computed from the colour tokens; text pairs are 6.6:1 or higher and UI
  borders are 3.9:1 or higher in both themes.
