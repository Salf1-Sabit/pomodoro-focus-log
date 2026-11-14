# Implementation Plan: Consistent Color Palette

**Branch**: `002-color-palette-design` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-color-palette-design/spec.md`

## Summary

Define one palette as CSS custom properties in a single `:root` block in `src/style.css`, make every
color in the stylesheet reference those tokens, and add a Vitest test that parses the tokens and
checks WCAG AA contrast for the main text/background pairs and the UI-component pairs. Focus and
break become distinguishable by more than color through a `data-kind` attribute on the timer section
that drives a border style and a text marker. No timer, log, storage, or alert behavior changes.
See [research.md](research.md) for the decisions and the gaps found in the current app.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) and plain CSS, as in feature 001

**Primary Dependencies**: None added. Contrast math is about 15 lines in the test file

**Storage**: N/A (unchanged)

**Testing**: Vitest (existing). One new test file reads `src/style.css` as text with `node:fs`; no DOM needed

**Target Platform**: Modern desktop and mobile browsers (unchanged)

**Project Type**: Single-page web app (static, client-only)

**Performance Goals**: N/A (no runtime cost beyond CSS)

**Constraints**: Visual only; no layout, font, or behavior change; no new dark-mode work (see research R4)

**Scale/Scope**: One stylesheet, one small attribute hook in `src/main.ts`, one test file

## Constitution Check

*GATE: passed before Phase 0 and re-checked after Phase 1.*

| Principle | Status | Note |
|-----------|--------|------|
| I. Simplicity First | Pass | No new dependency; contrast check is a small helper inside the test |
| II. Test-Backed Core Behavior | Pass | Timer and log tests are untouched and must keep passing; the new test guards the palette |
| III. Clear, Accessible Interface | Pass | This feature exists to enforce AA contrast, a visible focus ring, and state cues beyond color |
| IV. Private, Local-First Data | Pass | No data or network involved |
| V. Plain, Readable Code | Pass | Token names state their role; one comment per non-obvious color choice |
| Scope constraint | Pass | Styling of existing features only |
| Commits | Note | Small commits: tokens, markers, test, README. Trailer rule: see the Co-Authored-By conflict raised after `/speckit-specify` |

No violations; Complexity Tracking is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-color-palette-design/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── palette.md
└── tasks.md             # created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── style.css            # the one palette block; all other rules use var(--token)
└── main.ts              # render() also sets data-kind on #timer-section (presentation hook only)
index.html               # unchanged unless a marker element is needed
tests/
└── unit/
    └── palette.test.ts  # new: contrast pairs + "no hard-coded colors outside the palette"
```

**Structure Decision**: Keep the existing single-project layout. The palette lives in `src/style.css`
rather than a separate file, because one `:root` block is already "one place" and a second file
would add indirection (Principle I).

## Complexity Tracking

None.
