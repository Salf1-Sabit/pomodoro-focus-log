---

description: "Task list for the consistent color palette feature"
---

# Tasks: Consistent Color Palette

**Input**: Design documents from `/specs/002-color-palette-design/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/palette.md, quickstart.md

**Tests**: One automated palette test is required by the plan (research R5). Existing tests stay untouched.

**Organization**: Grouped by user story. Paths follow the single-project layout (`src/`, `tests/unit/`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 focus/break, US2 session log and outcomes, US3 weekly summary, US4 keyboard focus

## Phase 1: Setup

**Purpose**: Confirm the baseline before changing anything

- [ ] T001 Run `npm test` and `npm run build` at the repository root and record that all existing tests pass (baseline for FR-009)
- [ ] T002 [P] List every color literal and every `var(--...)` use in `src/style.css`, `index.html` and `src/main.ts`, and note any literal outside the `:root` blocks (research R1 says there should be none)

---

## Phase 2: Foundational (blocking)

**Purpose**: The single palette and the guard test. All stories depend on these tokens.

**⚠️ CRITICAL**: No user story work starts until this phase is done

- [ ] T003 Rewrite the palette block at the top of `src/style.css` as the one documented place for colors. Keep the existing tokens (`--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--accent-text`, `--danger`, `--focus`) and add `--focus-state`, `--break-state`, `--completed`, `--cancelled` per `data-model.md`. Use one `#rrggbb` value per token, with a comment giving each token's role. Do not change layout, spacing or fonts.
- [ ] T004 Give the same new tokens values in the existing `@media (prefers-color-scheme: dark)` block in `src/style.css` so dark-mode users keep passing contrast (research R4). Do not add other dark-mode work.
- [ ] T005 Create `tests/unit/palette.test.ts`: read `src/style.css` with `node:fs`, parse `--token: #rrggbb` from the light and dark blocks, compute WCAG 2.x relative luminance and contrast ratio, and assert the pairs listed in research R5 (4.5:1 for text pairs, 3:1 for border, focus ring, state marker and bar fill pairs) for both blocks. Give each assertion a message naming the pair and the measured ratio.
- [ ] T006 Add a second test in `tests/unit/palette.test.ts` that fails if a color literal (`#hex`, `rgb(`, `hsl(`) appears in `src/style.css` outside the palette blocks, in `index.html`, or in `src/main.ts` (FR-001, SC-006)
- [ ] T007 Run `npm test`. Adjust token values in `src/style.css` until T005 and T006 pass in both blocks, and the existing tests still pass

**Checkpoint**: Palette defined, guarded by tests, nothing else restyled yet

---

## Phase 3: User Story 1 - Recognize focus vs. break at a glance (P1) 🎯 MVP

**Goal**: Focus and break differ by color and by at least one non-color cue

**Independent Test**: Start a focus session and a break; in grayscale they still look different (quickstart step 2)

- [ ] T008 [US1] In `render()` in `src/main.ts`, set `timerSection.dataset.kind` to `"focus"` when `timer.kind === "focus"` and `"break"` for short and long breaks. Look the section up with the existing `element()` helper for `#timer-section`. This is a presentation hook only; do not change any timer, storage or alert logic.
- [ ] T009 [US1] In `src/style.css`, add rules keyed on `#timer-section[data-kind="focus"]` and `[data-kind="break"]`: a thick solid left border in `--focus-state` versus a dashed left border in `--break-state`, and a `::before` marker on `.timer-state` ("●" for focus, "◐" for break). The text of the state line stays unchanged.
- [ ] T010 [US1] Make sure the state line text uses a token color that meets 4.5:1 on `--surface` for both states. Add the focus-state and break-state text pairs to `tests/unit/palette.test.ts` if T005 did not already cover them.

**Checkpoint**: US1 works and can be demonstrated on its own

---

## Phase 4: User Story 4 - Keyboard focus stays visible (P1)

**Goal**: A clear focus outline on every control on every palette background

**Independent Test**: Tab through all controls on all screens (quickstart step 3)

- [ ] T011 [US4] In `src/style.css`, review the `:focus-visible` rule and set `outline` to `3px solid var(--focus)` with `outline-offset: 2px`, so the ring sits on the surrounding surface and not on the button's own fill. Keep it unchanged if it already does.
- [ ] T012 [US4] Add the focus ring contrast pairs to `tests/unit/palette.test.ts`: `--focus` against `--bg`, `--surface` and `--accent`, each at least 3:1, in both blocks
- [ ] T013 [US4] Add `@media (forced-colors: active)` handling in `src/style.css` only if the outline or state border would disappear (use system color keywords such as `CanvasText` and `Highlight`, not literals; keep the T006 test passing)

**Checkpoint**: US1 and US4 (both P1) are complete

---

## Phase 5: User Story 2 - Read the session log with clear outcomes (P2)

**Goal**: Completed and cancelled outcomes are distinct by color and by a non-color cue, using the timer's palette

**Independent Test**: Complete a session, then cancel one (quickstart step 4)

- [ ] T014 [P] [US2] In `src/main.ts`, `renderToday()`: add a class `log-entry` to each created `<li>`. The visible text stays as it is.
- [ ] T015 [P] [US2] In `src/style.css`, style `.log-entry` with `--completed` as a left border or marker, and add a "✓" `::before` marker (decorative). Text stays in `--text`.
- [ ] T016 [US2] In `src/main.ts`, `onCancel()` (near line 208): set `statusRegion.dataset.outcome = "cancelled"` after `announce("Cancelled.")`, and clear it in `announce()` for every other message. The announce text does not change.
- [ ] T017 [US2] In `src/style.css`, style `.status[data-outcome="cancelled"]` with `--cancelled` text, and give `#cancel-button` the `--cancelled` border and text color (outlined control). The word "Cancelled." is the non-color cue. Keep `--danger` for "Delete log" and the error text unless it can share `--cancelled` per `data-model.md`.
- [ ] T018 [US2] Add the `--completed` and `--cancelled` text pairs on `--surface` (4.5:1) and their marker pairs (3:1) to `tests/unit/palette.test.ts`

**Checkpoint**: US2 works; the existing log tests still pass

---

## Phase 6: User Story 3 - Consistent weekly summary (P3)

**Goal**: The weekly chart uses the same palette and stays readable

**Independent Test**: View the summary next to the timer and log (quickstart step 5)

- [ ] T019 [US3] In `src/style.css`, point `.bar` at `--completed` (the bars sum completed focus sessions) and keep `.bar-total` in `--text` and `.bar-day` in `--muted`. Keep `.bar-area`'s border on `--border`.
- [ ] T020 [US3] Add the bar fill versus `--surface` pair (3:1) and `.bar-day` muted-on-surface pair (4.5:1) to `tests/unit/palette.test.ts`

**Checkpoint**: All four stories complete

---

## Phase 7: Polish & cross-cutting

- [ ] T021 [P] Go through `contracts/palette.md` and confirm every rule is met. Fix `src/style.css` for any gap (hover, active and disabled states included, per the spec's edge cases)
- [ ] T022 [P] Add a short "Colors" section to `README.md`: where the palette lives, how to change it, and that `npm test` checks contrast
- [ ] T023 Run `npm test` and `npm run build`; confirm every existing test still passes unchanged (FR-009, SC-005)
- [ ] T024 Walk through `quickstart.md` manually in the browser, including grayscale and keyboard checks, and note the result in `specs/002-color-palette-design/quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1** → **Phase 2** (blocks everything) → stories → **Phase 7**
- US1 (P1) and US4 (P1) first. US2 (P2) and US3 (P3) can follow in any order, and do not depend on each other
- US2 and US3 both edit `src/style.css`, so avoid editing it in parallel unless the rules are in separate regions
- All test additions go into one file, `tests/unit/palette.test.ts`, so do them in sequence

### Parallel opportunities

- T002 with T001
- T014 and T015 (different files)
- T021 and T022

## Implementation Strategy

**MVP**: Phases 1 to 3 (palette, guard test, focus vs. break). Phase 4 completes the P1 scope. Then add US2 and US3, and finish with polish. Commit after each phase (small Conventional Commits, as the constitution requires).
