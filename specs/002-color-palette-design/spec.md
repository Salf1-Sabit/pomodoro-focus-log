# Feature Specification: Consistent Color Palette

**Feature Branch**: `002-color-palette-design`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Update the visual design of the Pomodoro and focus-log app with a consistent, professional color palette. Use one defined palette across the timer, session log and weekly summary, with distinct colors for focus, break, completed and cancelled states. All text and controls must meet WCAG AA contrast, and focus and break states must be distinguishable by more than color alone. Keyboard focus outlines must stay clearly visible. This is a visual change only: no existing behavior changes and all existing tests must keep passing. Out of scope: dark mode, layout redesign, new features, font changes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recognize focus vs. break at a glance (Priority: P1)

While using the timer, the person can immediately tell whether they are in a focus session or a break. Each state has its own color from the shared palette, and also a non-color cue (for example the visible state label and a distinct shape, icon, or pattern marker), so the distinction holds for people who cannot perceive the color difference.

**Why this priority**: The timer is the main screen, and confusing focus with break defeats its purpose. This is also an accessibility requirement in the constitution (state must not rely on color alone).

**Independent Test**: Start a focus session, then a break. Compare the two screens in normal view and in a grayscale rendering. The states must still be told apart in grayscale.

**Acceptance Scenarios**:

1. **Given** a focus session is active, **When** the person views the timer, **Then** it shows the focus color plus a non-color indicator naming the state.
2. **Given** a break is active, **When** the person views the timer, **Then** it shows the break color plus a different non-color indicator.
3. **Given** the timer screen in grayscale, **When** focus and break are compared, **Then** they can still be told apart.

---

### User Story 2 - Read the session log with clear outcomes (Priority: P2)

In the session log, each entry's outcome (completed or cancelled) and type (focus or break) uses the same palette as the timer. Completed and cancelled entries look clearly different from each other by more than color, such as a text label or marker.

**Why this priority**: The log is where the person reviews their record, and consistent colors link it to what they saw on the timer.

**Independent Test**: Open a log with completed and cancelled focus and break entries. Each of the four combinations must be distinguishable, and their colors must match the timer's.

**Acceptance Scenarios**:

1. **Given** a log with completed and cancelled sessions, **When** the person views it, **Then** each outcome has its own palette color and a non-color cue.
2. **Given** focus and break entries in the log, **When** viewed, **Then** they use the same focus and break colors as the timer.

---

### User Story 3 - Consistent weekly summary (Priority: P3)

The weekly summary (last-7-days totals and bar chart) uses the same palette, so bars and labels match the colors for focus and the other states elsewhere in the app.

**Why this priority**: It completes the consistency across all three areas, but it depends on the palette set up in the earlier stories.

**Independent Test**: View the weekly summary next to the timer and log. The same palette values must be in use, and every label and bar must stay readable.

**Acceptance Scenarios**:

1. **Given** the weekly summary, **When** viewed, **Then** its colors come from the same palette as the timer and log.
2. **Given** any bar or total in the summary, **When** checked, **Then** its text and graphical elements meet the contrast requirements.

---

### User Story 4 - Keyboard focus stays visible (Priority: P1)

A keyboard user tabbing through every control sees a clearly visible focus outline on each one, on every background color the new palette introduces.

**Why this priority**: Constitution Principle III requires a visible focus indicator, and a recolor can easily break it.

**Independent Test**: Tab through all controls on all screens. The focus indicator must be visible against its surroundings at every stop.

**Acceptance Scenarios**:

1. **Given** any interactive control, **When** it receives keyboard focus, **Then** a visible outline appears that meets the 3:1 contrast requirement against adjacent colors.
2. **Given** a control on a colored state background, **When** focused, **Then** the outline is still clearly visible.

---

### Edge Cases

- Disabled controls: they must look disabled yet remain legible. Text that conveys information still needs enough contrast.
- Text placed on state-colored backgrounds (focus, break, completed, cancelled) must meet AA contrast in each case.
- Hover, active, and focus states of a control must each meet contrast requirements, not only its resting state.
- Users with a forced-colors or high-contrast setting must not lose the focus outline or the non-color state cues.
- Empty log or empty weekly summary: placeholder text must also meet contrast.
- Printing or grayscale viewing: state differences must remain readable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST use one defined color palette, documented in one place, for the timer, session log, and weekly summary. No screen may use colors outside it.
- **FR-002**: The palette MUST give distinct colors to the focus, break, completed, and cancelled states.
- **FR-003**: All body text MUST have a contrast ratio of at least 4.5:1 against its background, and large text at least 3:1.
- **FR-004**: All controls and meaningful graphical elements (borders, icons, bar fills, state markers) MUST have a contrast ratio of at least 3:1 against adjacent colors.
- **FR-005**: Focus and break states MUST be distinguishable by at least one cue other than color, such as a text label, icon, or pattern.
- **FR-006**: Completed and cancelled outcomes in the log MUST be distinguishable by at least one cue other than color.
- **FR-007**: Every interactive control MUST show a clearly visible keyboard focus outline that meets 3:1 contrast against the surrounding colors, on every background in the palette.
- **FR-008**: This change MUST NOT alter any existing behavior: timer logic, log contents, totals, alerts, and storage all behave exactly as before.
- **FR-009**: All existing automated tests MUST continue to pass without being weakened or removed.
- **FR-010**: The change MUST NOT add dark mode, change the layout, add features, or change fonts.

### Key Entities

- **Color palette**: The single set of named colors (neutral surface and text colors, plus focus, break, completed, cancelled, and focus-outline colors) used throughout the app. Each entry has a defined role and verified contrast against the backgrounds it is used on.
- **Visual state**: One of focus, break, completed, or cancelled. Each pairs a palette color with a non-color cue.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of text/background combinations in the app meet 4.5:1 (or 3:1 for large text), verified by a contrast check of every pairing.
- **SC-002**: 100% of controls, borders, and state markers meet 3:1 against adjacent colors.
- **SC-003**: In a grayscale rendering, a person can correctly tell focus from break and completed from cancelled on every screen.
- **SC-004**: Tabbing through all controls on all screens shows a visible focus outline at every stop, with 0 exceptions.
- **SC-005**: The full existing test suite passes unchanged, and the app's behavior is identical before and after.
- **SC-006**: A review of the three areas (timer, log, weekly summary) finds the same palette used throughout, with 0 colors outside it.

## Assumptions

- The app has a single light theme today; dark mode is out of scope, so the palette targets that one theme.
- "Professional" means a restrained, cohesive palette with neutral surfaces and a small number of accent colors, rather than a specific brand identity.
- Fonts, spacing, and layout stay as they are.
- Non-color cues may reuse text labels the app already shows. New icons or patterns may be added only as visual markers, not as new features.
- WCAG 2.x AA is the contrast standard, as already stated in the project constitution.
- Contrast is checked against the final rendered colors, including hover, active, focus, and disabled states.
