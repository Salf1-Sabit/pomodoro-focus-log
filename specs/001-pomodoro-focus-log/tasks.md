---

description: "Task list for the Pomodoro Focus Log"
---

# Tasks: Pomodoro Focus Log

**Input**: Design documents from `/specs/001-pomodoro-focus-log/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/storage.md, contracts/ui.md, quickstart.md

**Tests**: Required. The constitution (Principle II) makes tests for timer logic and log totals a condition of "done", so test tasks come before the implementation they cover.

**Organization**: Tasks are grouped by user story so each can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: User story the task belongs to (US1 to US5)
- All paths are relative to the repository root

## Commit Convention (from the constitution)

Commit after each task or small logical group using Conventional Commits (`feat:`, `test:`, `chore:`, `docs:`, `refactor:`). One logical change per commit, project working at each commit, no AI co-author trailer.

---

## Phase 1: Setup

**Purpose**: Project initialization

- [X] T001 Create `package.json` with scripts `dev` (vite), `build` (tsc --noEmit && vite build), `test` (vitest run); dev dependencies only: `typescript`, `vite`, `vitest`; no runtime dependencies
- [X] T002 [P] Create `tsconfig.json` with `strict: true`, `target: ES2022`, `module: ESNext`, `moduleResolution: Bundler`, `lib: [ES2022, DOM]`, including `src` and `tests`
- [X] T003 [P] Create `vite.config.ts` (with Vitest `test` config using the default `node` environment, `include: ["tests/**/*.test.ts"]`) and `.gitignore` (node_modules, dist)
- [X] T004 Create the empty directory layout: `src/`, `tests/unit/`, and an `index.html` shell with `<main>`, title "Pomodoro Focus Log", `lang="en"`, viewport meta, and a module script pointing at `src/main.ts`

---

## Phase 2: Foundational (blocks all user stories)

**Purpose**: Shared types, constants and storage used by every story

- [X] T005 Define shared types and constants in `src/types.ts`: `TimerState` and `LogEntry` exactly as in data-model.md, `FOCUS_MS = 25 * 60 * 1000`, `SHORT_BREAK_MS = 5 * 60 * 1000`, `LONG_BREAK_MS = 15 * 60 * 1000`, `CYCLE_LENGTH = 4`, `MAX_LABEL_LENGTH = 60`
- [X] T006 [P] Write failing tests for storage in `tests/unit/storage.test.ts` using an in-memory fake `Storage`: missing key loads defaults; corrupt JSON loads defaults without throwing; invalid log entries are dropped while valid ones are kept; a throwing `setItem` is reported, not thrown
- [X] T007 Implement `src/storage.ts` with `loadTimer`, `saveTimer`, `loadLog`, `saveLog` using keys `pomodoro.timer.v1` and `pomodoro.log.v1` per contracts/storage.md; take a `Storage` argument so tests can pass a fake (depends on T005, T006)
- [X] T008 [P] Add base styles in `src/style.css`: colour tokens meeting WCAG AA (4.5:1 body text, 3:1 UI), `prefers-color-scheme` dark variant, visible `:focus-visible` outline on all controls, `prefers-reduced-motion` handling, responsive single column layout; link it from `index.html`

**Checkpoint**: Foundation ready, user stories can begin

---

## Phase 3: User Story 1 - Run a Pomodoro cycle (Priority: P1) 🎯 MVP

**Goal**: Start, pause, resume and cancel focus sessions and breaks, with the 5 and 15 minute break rules and a countdown that stays accurate.

**Independent Test**: Start a session, pause, resume, let it finish, and confirm the right break is offered; verified by `tests/unit/timer.test.ts` and the manual quickstart scenarios 1, 2, 4, 5 and 8.

### Tests for User Story 1 (write first, confirm they fail)

- [ ] T009 [US1] Write failing tests in `tests/unit/timer.test.ts` for transitions with fixed `now` values: `start` sets `endsAt = now + 25 min` and `status: "running"`; `pause` stores `remainingMs` and clears `endsAt`; `resume` sets `endsAt = now + remainingMs`; `cancel` of a focus session returns idle focus with `completedFocusCount` unchanged and no log entry; invalid actions (pause while idle, resume while running) return the state unchanged
- [ ] T010 [US1] Add failing tests in `tests/unit/timer.test.ts` for completion via `check(state, now)`: not finished before `endsAt`; at `now >= endsAt` a focus session returns idle state with `completedFocusCount + 1` and a completed-session result; a break completion returns idle focus
- [ ] T011 [US1] Add failing tests in `tests/unit/timer.test.ts` for the four-session cycle: completions 1 to 3 offer `shortBreak` (5 min), the 4th offers `longBreak` (15 min); `completedFocusCount` resets to 0 when a long break completes or is cancelled; cancelling a focus session mid-cycle does not change the count; cancelling a break returns idle focus
- [ ] T012 [US1] Add failing tests in `tests/unit/timer.test.ts` for time accuracy: `remainingMs(state, now)` equals `max(0, endsAt - now)` while running, equals the stored value while paused, and a `check` with a `now` far past `endsAt` (simulated sleep) completes the session and reports the original `endsAt` as the completion time

### Implementation for User Story 1

- [ ] T013 [US1] Implement `src/timer.ts` as pure functions with no DOM, storage or clock access: `initialState()`, `start`, `pause`, `resume`, `cancel`, `check`, `remainingMs`, `durationFor(kind)`, following the transition table in data-model.md until T009 to T012 pass (depends on T005)
- [ ] T014 [US1] Add the timer markup to `index.html`: a `<section aria-labelledby>` Timer region with the state text, `MM:SS` display, cycle progress ("Session 2 of 4"), and Start, Pause, Resume and Cancel `<button>` elements
- [ ] T015 [US1] Implement `src/main.ts` wiring: load state from `src/storage.ts` on start, call `check` immediately and then once per second, render remaining time and state text, handle button clicks through the `src/timer.ts` functions, save state after every change, hide buttons that do not apply to the current status
- [ ] T016 [US1] Add keyboard shortcuts in `src/main.ts` per contracts/ui.md (`S` start, `P` pause or resume, `C` cancel), ignored while a text field has focus, and an `aria-live="polite"` status region announcing start, pause, resume and cancel (not the per-second countdown)
- [ ] T016a [US1] Add an `aria-live="assertive"` error region to `index.html` and show "Could not save your data on this device" from `src/main.ts` when `saveTimer` or `saveLog` reports a failed write; the timer MUST keep running (depends on T015)
- [ ] T017 [US1] Manually verify quickstart scenarios 1, 2, 4, 5 and 8 for the timer and record any deviation in the task commit message

**Checkpoint**: A usable timer. This is the MVP.

---

## Phase 4: User Story 2 - Log completed sessions (Priority: P2)

**Goal**: Each completed focus session is saved with an optional label; cancelled sessions and breaks are never saved. Includes export and delete (FR-014).

**Independent Test**: Complete one session with a label and one without, cancel a third; the log holds exactly two entries and survives a reload.

### Tests for User Story 2 (write first, confirm they fail)

- [ ] T018 [US2] Write failing tests in `tests/unit/log.test.ts` for `makeEntry(completedAt, label)`: `durationMs` is 25 minutes; label is trimmed; label longer than 60 characters is cut to "60 characters" (`MAX_LABEL_LENGTH`); an empty label stays empty; ids are unique for entries with the same `completedAt`
- [ ] T019 [US2] Write failing tests in `tests/unit/log.test.ts` for `toCsv(entries)`: header is `completed_at,duration_minutes,label`; `completed_at` is local `YYYY-MM-DDTHH:mm:ss`; labels with commas, quotes or newlines are quoted with doubled quotes; labels beginning with `=`, `+`, `-` or `@` get a leading `'`; an empty log yields the header only
- [ ] T020 [P] [US2] Add failing tests in `tests/unit/timer.test.ts` that the `check` result for a completed focus session carries the label held in the state, and that a cancelled or break completion carries no entry data

### Implementation for User Story 2

- [ ] T021 [US2] Implement `makeEntry` and `toCsv` in `src/log.ts` (pure) until T018 and T019 pass (depends on T005)
- [ ] T022 [US2] Update `src/timer.ts` so `check` returns the completed session's end time and label (`label` field in `TimerState`, capped at `MAX_LABEL_LENGTH`), and add `setLabel(state, text)`; make T020 pass (depends on T013)
- [ ] T023 [US2] Add a labelled text input (`<label for>` "What are you working on?", `maxlength="60"`) to the Timer region in `index.html`
- [ ] T024 [US2] In `src/main.ts`, update the label through `setLabel` on input (before and during a session), and on a completed focus session create the entry with `makeEntry`, append to the log and call `saveLog`, then keep the label field value for the next session
- [ ] T024a [US2] Show a short note "Limited to 60 characters" in a `role="status"` element under the label field in `index.html` and `src/main.ts` when the input reaches `MAX_LABEL_LENGTH` (60); clear it when the length drops below the limit (depends on T023, T024)
- [ ] T025 [US2] Add Export CSV and Delete log buttons to `index.html`; in `src/main.ts` implement export as a download named `focus-log-YYYY-MM-DD.csv` built from `toCsv`, and delete with a confirmation prompt that clears the log; no network calls
- [ ] T026 [US2] Manually verify quickstart scenarios 3, 9 and 10, including that labels are saved with no prompt at session end

**Checkpoint**: Sessions are saved, exported and deletable.

---

## Phase 5: User Story 3 - Today's sessions and total (Priority: P3)

**Goal**: Show today's completed sessions and total focused time.

**Independent Test**: With entries across several days, only today's are listed and the total equals their sum; an empty day shows an empty state and zero.

### Tests for User Story 3 (write first, confirm they fail)

- [ ] T027 [US3] Write failing tests in `tests/unit/log.test.ts` for `entriesForDay(entries, day)` and `dailyTotalMs(entries, day)`: only entries in that local calendar day count; an entry at 23:59 and one at 00:01 fall on different days; no entries gives zero
- [ ] T028 [US3] Add a failing test in `tests/unit/log.test.ts` for `formatDuration(ms)` giving text like `1 h 15 min`, `25 min` and `0 min`

### Implementation for User Story 3

- [ ] T029 [US3] Implement `entriesForDay`, `dailyTotalMs` and `formatDuration` in `src/log.ts` until T027 and T028 pass (depends on T021)
- [ ] T030 [US3] Add a "Today" `<section>` to `index.html` with a list for sessions (time and label) and a "Total focused" line, plus empty-state text
- [ ] T031 [US3] Render the Today section in `src/main.ts` and refresh it whenever a session is logged, on load, and when the local date changes while the page is open
- [ ] T032 [US3] Manually verify quickstart scenario 7 for today's totals

**Checkpoint**: Today's progress is visible.

---

## Phase 6: User Story 4 - Last 7 days summary (Priority: P4)

**Goal**: A bar chart of focused time for each of the last 7 days ending today.

**Independent Test**: Log sessions on several of the last 7 days; each bar and its text value match the sum for that day, and empty days show zero.

### Tests for User Story 4 (write first, confirm they fail)

- [ ] T033 [US4] Write failing tests in `tests/unit/log.test.ts` for `lastSevenDays(entries, now)`: returns 7 items oldest first, the last being today; zero days are included; totals match the entries per day; entries older than 7 days are excluded
- [ ] T034 [US4] Add failing tests in `tests/unit/log.test.ts` that `lastSevenDays` stays correct across a daylight-saving change (days built by calendar-date arithmetic, so there are never duplicate or missing days) and for a session completed just before midnight

### Implementation for User Story 4

- [ ] T035 [US4] Implement `lastSevenDays` in `src/log.ts` using `new Date(y, m, d - i)` for day starts until T033 and T034 pass (depends on T029)
- [ ] T036 [US4] Add a "Last 7 days" `<section>` to `index.html` and render it in `src/main.ts` as one element per day with a height set as a percentage of the largest total (minimum visible height for non-zero days), a day label, and the total as text under each bar
- [ ] T037 [P] [US4] Style the chart in `src/style.css` with AA-contrast colours, no reliance on colour alone (text values stay visible), and a readable layout at phone width
- [ ] T038 [US4] Manually verify quickstart scenario 7 for the chart

**Checkpoint**: The last 7 days are visible.

---

## Phase 7: User Story 5 - Alerts (Priority: P5)

**Goal**: Alert when a focus session or break ends: tone, on-page message, title change, plus a system notification when permitted.

**Independent Test**: Run a session to the end with the tab in the background; with notifications allowed and blocked, and with sound muted, the person is still alerted.

### Tests for User Story 5 (write first, confirm they fail)

- [ ] T039 [P] [US5] Write failing tests in `tests/unit/alerts.test.ts` for a pure `alertContent(kindEnded)` returning the message and title text for "focus ended" and "break ended", and for `shouldNotify(permission, supported)` returning true only when supported and `"granted"`

### Implementation for User Story 5

- [ ] T040 [US5] Implement `src/alerts.ts`: `alertContent` and `shouldNotify` (pure, passing T039), plus `playTone()` using a short Web Audio oscillator beep (no audio file), `notify(text)` guarded by `shouldNotify`, and `setTitle(text)`; create the audio context lazily on the first user click; wrap every browser API call so failure never breaks the other alerts
- [ ] T041 [US5] Request notification permission on the first Start click in `src/main.ts` (only if permission is `"default"`); denial or lack of support must leave the other alerts working
- [ ] T042 [US5] On timer completion in `src/main.ts` (including a session found already finished on page load), call tone, show a visible message in the `aria-live` status region, set the window title, and send the notification; restore the original title on the next interaction
- [ ] T043 [US5] Manually verify quickstart scenario 6 with notifications allowed, blocked, and sound muted

**Checkpoint**: All five stories work.

---

## Phase 8: Polish & Cross-Cutting

**Purpose**: Checks that span stories

- [ ] T044 Run `npm test` and `npm run build`; fix any failure; confirm the timer, cycle and totals tests all pass (constitution Principle II)
- [ ] T045 [P] Accessibility pass over `index.html` and `src/style.css`: every control keyboard reachable with a visible focus outline, every input has a label, buttons have accessible names, colour contrast meets WCAG AA in light and dark
- [ ] T046 [P] Privacy pass: search `src/` for `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` and third-party URLs and confirm none exist; confirm no network requests after load in the browser network panel
- [ ] T047 [P] Readability pass over `src/`: descriptive names, small functions, comments only for non-obvious decisions (Principle V); remove anything not required by a user story (Principle I)
- [ ] T048 Add a short `README.md` with run, test and build commands and the privacy statement (data stays in the browser)
- [ ] T049 Run all ten scenarios in `specs/001-pomodoro-focus-log/quickstart.md` and note results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** then **Foundational (2)** then user stories. Foundational blocks all stories.
- **US1 (3)** is the MVP and has no story dependencies.
- **US2 (4)** extends `src/timer.ts` (T022) and `src/main.ts`, so it follows US1.
- **US3 (5)** needs `src/log.ts` from US2 (T021) and the log being saved.
- **US4 (6)** needs the day helpers from US3 (T029).
- **US5 (7)** needs only the timer completion hook from US1 and can be done any time after US1; it is ordered last by priority.
- **Polish (8)** after all desired stories.

### Within Each Story

- Tests first and failing, then pure-module implementation, then HTML and `main.ts` wiring, then the manual check.
- `src/main.ts`, `index.html` and `src/style.css` are shared, so tasks touching the same one are not marked [P].

### Parallel Opportunities

- Setup: T002 and T003 together.
- Foundational: T006 and T008 together.
- Tasks that edit the same file are never marked [P]; for example the tests in `tests/unit/timer.test.ts` (T009 to T012) and in `tests/unit/log.test.ts` (T018, T019, T027, T028, T033, T034) are done one after another.
- US2: T020 (`tests/unit/timer.test.ts`) can be written alongside T018 and T019 (`tests/unit/log.test.ts`); T021 and T022 touch different files.
- Tests for a later story can be drafted while the previous story is being implemented, provided they are in a different file from the task in progress.
- US5 (T039, T040) touches only new files and can run alongside US2 to US4 if staffed.
- Polish: T045, T046 and T047 together.

## Parallel Example: User Story 2

```text
Task: "Write failing tests for makeEntry and toCsv in tests/unit/log.test.ts" (T018 then T019, same file)
Task: "Add failing completion-label tests in tests/unit/timer.test.ts"        (T020, different file, can run alongside)
```

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup, then Phase 2 Foundational.
2. Phase 3 (US1) with its tests passing.
3. Stop and validate with quickstart scenarios 1, 2, 4, 5 and 8.

### Incremental Delivery

1. Setup + Foundational.
2. US1 (timer) as the MVP.
3. US2 (log, export, delete), then US3 (today), US4 (7 days), US5 (alerts).
4. Polish, then the full quickstart run.

## Notes

- Tests for timer logic and log totals must pass before any story is marked done.
- Never mark a task complete while its tests are missing or failing.
- Commit after each task or logical group with a Conventional Commits message and no AI co-author trailer.
