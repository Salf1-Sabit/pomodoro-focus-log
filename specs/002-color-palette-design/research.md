# Research: Consistent Color Palette

## R1. Current state of the stylesheet

- **Finding**: `src/style.css` already uses custom properties (`--bg`, `--surface`, `--text`, `--muted`,
  `--border`, `--accent`, `--accent-text`, `--danger`, `--focus`). No hex, rgb, or hsl values appear outside
  the `:root` blocks, in CSS, `index.html`, or `src/main.ts`.
- **Decision**: Extend and rename this token set into the single palette. The "replace all hard-coded
  colors" step is therefore a verification (enforced by a test), not a large rewrite.

## R2. Where the four states actually appear

- **Finding**: The app has no cancelled entries and no break entries in the log. The log stores only
  completed focus sessions. Cancel just resets the timer. So "cancelled" and "break" have no log presentation
  today, and adding one would be a new feature (out of scope).
- **Decision**:
  - **Focus / break**: shown on the timer section.
  - **Completed**: shown on log entries and the weekly bars, which all represent completed focus sessions.
  - **Cancelled**: shown on the Cancel control and its status message, the only place cancellation appears.
  - The palette still defines all four tokens, so a future log of cancelled sessions can reuse them.
- **Alternatives rejected**: Adding cancelled and break rows to the log (new behavior, violates FR-008/FR-010).

## R3. Non-color cue for focus vs. break

- **Decision**: `render()` sets `data-kind="focus" | "break"` on `#timer-section`. CSS then gives
  focus a solid, thick left border and a "●" text marker, and break a dashed border and a "◐" marker, both
  via `::before` on the state line. The existing state text ("Focus", "Short break") remains the primary cue.
- **Rationale**: Reuses the text already shown. The attribute is presentation-only and does not touch timer state or logic.
- **Alternatives rejected**: Icons through images (extra assets); changing the label text (would change
  behavior and maybe tests).

## R4. Existing dark-mode block

- **Finding**: The stylesheet has a `prefers-color-scheme: dark` override that predates this spec.
- **Decision**: Do not add or extend dark-mode features, but keep the override in the same single palette
  place with values for the new state tokens, so existing dark-mode users do not get light-theme state
  colors on a dark background. The contrast test covers both blocks. Surfaced in the report so the user can
  instead ask for the block to be removed.
- **Alternatives rejected**: Deleting the block (removes existing behavior); leaving the new tokens light-only (breaks contrast in dark).

## R5. Automated contrast check

- **Decision**: A Vitest test reads `src/style.css`, parses `--token: #rrggbb` declarations from each palette
  block, computes WCAG 2.x relative luminance and contrast, and asserts a list of named pairs:
  - **4.5:1 (text)**: text on bg, text on surface, muted on bg and surface, accent-text on accent, focus-state
    text on its state background, completed and cancelled text on surface.
  - **3:1 (UI)**: border on bg and surface, focus outline on bg, surface and accent, state marker colors on
    surface, bar fill on surface.
  - It also fails if a color literal (`#`, `rgb(`, `hsl(`) appears outside the palette blocks.
- **Rationale**: No dependency needed; runs in the existing `npm test`.
- **Alternatives rejected**: An external contrast library (dependency, Principle I); manual browser audits only (not repeatable).

## R6. Choosing the palette values

- **Decision**: Neutral slate surfaces, a deep blue for focus, a teal-green for break, a dark green for
  completed, and a dark red for cancelled. Final hex values are picked during implementation and must pass the
  checks in R5; the test, not this document, is the authority. Hue differences are kept large and lightness is
  kept distinct so grayscale still separates them.
