# Implementation Plan: Pomodoro Focus Log

**Branch**: `001-pomodoro-focus-log` | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-pomodoro-focus-log/spec.md`

## Summary

A single-page browser app with a Pomodoro timer (25/5/15 minutes, long break after four
completed focus sessions), a focus log, today's view, and a 7-day bar chart. Timer logic is a
pure TypeScript module that takes the current time as an argument and computes remaining time
from a stored end timestamp, so it is unit-testable and stays correct when the tab is in the
background or the computer sleeps. All data lives in `localStorage`; there is no backend and no
network call. Alerts are an audio cue, an in-page message and a title change, plus a Web
Notification when permission is granted.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), targeting evergreen browsers

**Primary Dependencies**: None at runtime. Dev-only: `typescript`, `vite`, `vitest`

**Storage**: Browser `localStorage` (two JSON keys, versioned)

**Testing**: Vitest (unit tests on pure modules; no DOM environment needed)

**Target Platform**: Modern desktop and mobile browsers

**Project Type**: Single-page web app (static, client-only)

**Performance Goals**: Displayed time accurate within 1 second over 25 minutes (SC-002); UI
updates once per second

**Constraints**: Offline-capable (no network calls); keyboard operable; WCAG AA contrast;
no UI framework and no charting library

**Scale/Scope**: One user, one device, a few thousand log entries at most, 1 screen

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | Pass | Zero runtime deps; three dev deps, all required by the requested toolchain. No framework, router, state library or chart library. |
| II. Test-Backed Core Behavior | Pass | Pure `timer` and `log` modules take `now` as an argument, so no real waiting; Vitest covers transitions, the cycle and totals. |
| III. Clear, Accessible Interface | Pass | Native `<button>`/`<input>`, visible focus, labels, `aria-live` status, bar chart with text values (not color alone), AA palette. |
| IV. Private, Local-First Data | Pass | `localStorage` only; no network code; CSV export and delete in the UI. Notification and audio APIs are local. |
| V. Plain, Readable Code | Pass | Small modules, no clever abstractions; a pure reducer-style API. |
| Scope constraint | Pass | Only timer and log features from the spec. |

Post-design re-check: still passes. No complexity violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-pomodoro-focus-log/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── storage.md       # localStorage keys and JSON shapes, CSV export format
│   └── ui.md            # Controls, keyboard shortcuts, status announcements
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
index.html
package.json
tsconfig.json
vite.config.ts
src/
├── types.ts      # Shared types and constants (durations, cycle length, label limit)
├── timer.ts      # Pure state transitions; no DOM, no storage, takes `now`
├── log.ts        # Pure: day/7-day totals, CSV building
├── storage.ts    # localStorage load/save with validation and safe fallback
├── alerts.ts     # Audio cue, Notification, title change (browser APIs)
├── main.ts       # Wires modules to the DOM; one-second render loop
└── style.css
tests/
└── unit/
    ├── timer.test.ts
    ├── log.test.ts
    ├── storage.test.ts
    └── alerts.test.ts
```

**Structure Decision**: A single project at the repository root. Anything that touches the
browser (`storage`, `alerts`, `main`) is kept thin and out of the tested core. `timer.ts` and
`log.ts` hold all logic that the constitution requires to be tested.

## Complexity Tracking

No constitution violations; nothing to justify.
