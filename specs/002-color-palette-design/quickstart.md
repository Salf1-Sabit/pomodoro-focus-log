# Quickstart: Validating the Color Palette

**Prerequisites**: `npm install`

## Automated

1. `npm test`. All existing tests plus `palette.test.ts` pass (FR-009, SC-001, SC-002, SC-006).
2. `npm run build`. Type-check and build succeed.

## Manual (about 5 minutes)

1. `npm run dev`, open the app.
2. **Focus vs. break (SC-003)**: Start a focus session, then let a break start (or reload with a stored break
   state). Toggle grayscale in browser dev tools rendering emulation. The two states still differ by border
   style and marker.
3. **Keyboard (SC-004)**: Tab through every control. A clear outline appears at each stop, including on
   buttons inside the timer section in each state.
4. **Completed and cancelled**: Complete a session, so the log shows a completed marker. Press Cancel, so the
   status shows "Cancelled" in the cancelled color.
5. **Weekly summary**: Bars and totals use the same palette and stay readable.
6. **Behavior unchanged (SC-005)**: Timer, shortcuts, alerts, export, and delete work as before.
