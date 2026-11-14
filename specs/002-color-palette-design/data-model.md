# Data Model: Consistent Color Palette

No stored data changes. The only "data" is the palette: named tokens in `src/style.css`.

## Palette tokens

| Group | Tokens | Role |
|-------|--------|------|
| Neutrals | `--bg`, `--surface`, `--text`, `--muted`, `--border` | Page, cards, body text, secondary text, control and divider lines |
| Action | `--accent`, `--accent-text` | Primary buttons, weekly bar fill, and the text on them |
| State | `--focus-state`, `--break-state`, `--completed`, `--cancelled` | One color per visual state |
| Focus ring | `--focus` | Keyboard focus outline |

`--danger` is merged into `--cancelled` if the "Delete log" button can share it; otherwise it stays
and is documented as separate.

## Visual state

| State | Where shown | Color token | Non-color cue |
|-------|-------------|-------------|---------------|
| Focus | Timer section | `--focus-state` | Solid thick left border, "●" marker, state text |
| Break | Timer section | `--break-state` | Dashed left border, "◐" marker, state text |
| Completed | Log entries, weekly bars | `--completed` | "✓" marker or text, bar total text |
| Cancelled | Cancel control and its status message | `--cancelled` | Text "Cancelled", outlined control |

## Rules

- Every color value is declared only inside the palette block(s); everything else uses `var(--token)`.
- Each token has at least one tested contrast pair (see research R5).
