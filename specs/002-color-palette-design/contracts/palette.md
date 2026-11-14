# UI Contract: Palette and State Cues

This is the contract between the stylesheet and the rest of the UI.

## Palette block

- All color literals appear only inside `:root { ... }` (and the existing `prefers-color-scheme: dark`
  override, which uses the same token names).
- Any other rule refers to colors with `var(--token)`.

## State hook

- `#timer-section` carries `data-kind="focus"` or `data-kind="break"`, set by `render()`. It is a
  presentation hook only: nothing in timer logic reads it.

## Required contrast (WCAG 2.x)

| Kind | Minimum | Pairs |
|------|---------|-------|
| Body text | 4.5:1 | text, muted, state text on bg and surface; accent-text on accent |
| Large text and UI parts | 3:1 | borders, focus ring, state markers, bar fill |

## Guarded by

`tests/unit/palette.test.ts`, run by `npm test`.
