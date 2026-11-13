# Feature Specification: Pomodoro Focus Log

**Feature Branch**: `001-pomodoro-focus-log`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "Build a Pomodoro timer with a focus log. A person who wants to work in focused intervals can start a 25-minute focus session, take a 5-minute break afterward, and after four sessions take a longer 15-minute break. They can pause, resume or cancel a session. Each completed focus session is saved to a log with an optional short label describing what they worked on. The person can see today's completed sessions and total focused time, plus a weekly summary showing focused time per day. The timer should alert the person when a session or break ends."

## Clarifications

### Session 2026-11-13

- Q: When does the person enter the optional label for a focus session? → A: Before or during the session, via a label field on the timer screen; it is saved automatically on completion.
- Q: Which days should the weekly summary cover? → A: The last 7 days, ending today (rolling view).
- Q: How should the person be alerted when a session or break ends? → A: A sound plus a visible in-app message, with the window title also changing; no system notifications. (Amended 2026-11-13 by plan: a system notification is added when the person grants permission; the sound, message and title change always remain.)
- Q: What format should the exported log use? → A: CSV, one row per completed session.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a Pomodoro cycle (Priority: P1)

A person starts a 25-minute focus session. When it ends they take a 5-minute break. After every fourth completed focus session, the break is a longer 15-minute one. They can pause, resume, or cancel the current session or break at any time.

**Why this priority**: The timer cycle is the core of the app; everything else depends on it.

**Independent Test**: Start a session, observe the countdown, pause and resume it, let it complete, and confirm the correct break follows. Fully testable without the log.

**Acceptance Scenarios**:

1. **Given** the timer is idle, **When** the person starts a focus session, **Then** a 25-minute countdown begins.
2. **Given** a focus session is running, **When** the person pauses, **Then** the countdown stops and the remaining time is held until they resume.
3. **Given** a session is paused, **When** the person resumes, **Then** the countdown continues from the held remaining time.
4. **Given** a focus session is running or paused, **When** the person cancels it, **Then** the timer returns to idle and the session does not count toward the four-session cycle.
5. **Given** the first, second, or third focus session completes, **When** it ends, **Then** a 5-minute break is offered.
6. **Given** the fourth focus session completes, **When** it ends, **Then** a 15-minute break is offered and the session count resets afterward.
7. **Given** a break is running, **When** the person cancels it, **Then** the timer returns to idle, ready for the next focus session.

---

### User Story 2 - Log completed sessions (Priority: P2)

Each completed focus session is saved to a log with the time it finished, its length, and an optional short label describing what the person worked on.

**Why this priority**: The log gives the timer lasting value, and the summaries depend on it.

**Independent Test**: Complete a session with a label and another without; verify both entries exist, and that a cancelled session produces none.

**Acceptance Scenarios**:

1. **Given** the person entered a label before or during a focus session, **When** the session completes, **Then** the entry is saved with that label automatically, with no further prompt.
2. **Given** the person entered no label, **When** the session completes, **Then** the entry is saved without a label.
3. **Given** a focus session is cancelled, **When** it is cancelled, **Then** no log entry is created.
4. **Given** the app is closed and reopened, **When** the person views the log, **Then** previously saved entries are still present.

---

### User Story 3 - See today's sessions and total (Priority: P3)

The person can view the focus sessions they completed today and the total focused time for today.

**Why this priority**: It gives immediate feedback on the day's progress.

**Independent Test**: Log several sessions across today and earlier days; confirm only today's are listed and the total equals their summed length.

**Acceptance Scenarios**:

1. **Given** sessions were completed today, **When** the person opens today's view, **Then** each is listed with its time and label, and the total focused time is shown.
2. **Given** no sessions were completed today, **When** the person opens today's view, **Then** an empty state and a total of zero are shown.

---

### User Story 4 - Last 7 days summary (Priority: P4)

The person can see a last-7-days summary showing the focused time for each of the last 7 days, ending today.

**Why this priority**: It shows trends but is not needed for day-to-day use.

**Independent Test**: Log sessions on different days within the last 7 days; confirm each day shows the correct total, and days with no sessions show zero.

**Acceptance Scenarios**:

1. **Given** sessions were logged on several of the last 7 days, **When** the person opens the last-7-days summary, **Then** each of those 7 days (ending today) shows its focused time total.
2. **Given** a day in the last 7 days has no sessions, **When** the summary is shown, **Then** that day shows zero.

---

### User Story 5 - Alerts when a session or break ends (Priority: P5)

The person is alerted when a focus session or break ends, even if they are looking at something else.

**Why this priority**: It makes the timer practical to use hands-off, but the timer is usable without it.

**Independent Test**: Run a session to completion while the app is not in focus and confirm an alert is noticeable; repeat for a break.

**Acceptance Scenarios**:

1. **Given** a focus session is running, **When** it reaches zero, **Then** a sound plays, a visible message says the session has ended, the window title changes to show it, and a system notification appears if the person has allowed notifications.
2. **Given** a break is running, **When** it reaches zero, **Then** a sound plays, a visible message says the break has ended, the window title changes to show it, and a system notification appears if the person has allowed notifications.
3. **Given** the person cannot hear sounds, **When** an alert fires, **Then** a visible indication is also shown.

---

### Edge Cases

- The app is closed or the device sleeps mid-session: the timer reflects real elapsed time on return, and a session that ended in the meantime is completed and logged.
- Sound is blocked or unavailable: the visible message and title change still appear.
- The label is very long: it is limited to a short maximum length and the person is told when it is trimmed.
- A session completes close to midnight: it counts toward the day it finished.
- Cancelling mid-cycle: the completed-session count for the long break is unaffected.
- Pausing and never resuming: the session stays paused until resumed or cancelled and is never logged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let the person start a 25-minute focus session.
- **FR-002**: The system MUST offer a 5-minute break after a completed focus session, and a 15-minute break after every fourth completed focus session.
- **FR-003**: The system MUST let the person pause, resume, and cancel a running focus session or break.
- **FR-004**: The system MUST display the remaining time and the current state (idle, focus, break, paused).
- **FR-005**: The system MUST count only completed focus sessions toward the four-session cycle; cancelled sessions do not count.
- **FR-006**: The system MUST save each completed focus session to a log with its completion time, its duration, and an optional label.
- **FR-007**: The system MUST NOT log cancelled sessions or breaks.
- **FR-008**: The system MUST limit labels to a short maximum length (assumed 60 characters).
- **FR-008a**: The system MUST provide a label field on the timer screen that can be edited before and during a focus session, and MUST save its value with the log entry when the session completes.
- **FR-009**: The system MUST show today's completed sessions and today's total focused time.
- **FR-010**: The system MUST show a last-7-days summary of focused time for each of the last 7 days, ending today, including days with zero.
- **FR-011**: The system MUST alert the person when a focus session ends and when a break ends, with a sound plus a visible in-app message and a window title change, so the alert does not depend on sound alone. A system notification MUST also be shown when the person has granted permission; denying permission MUST NOT remove any other alert.
- **FR-012**: The system MUST keep the log between uses.
- **FR-013**: The system MUST store all data locally on the person's device and MUST NOT send it elsewhere.
- **FR-014**: The person MUST be able to export their log as a CSV file (one row per completed session, with completion time, duration, and label) and to delete their log.
- **FR-015**: All controls MUST be usable by keyboard and meet WCAG AA contrast.

### Key Entities

- **Timer State**: A running or paused focus session or break, with its kind (focus, short break, long break), remaining time, and state.
- **Log Entry**: A record of one completed focus session, with its completion time, duration, and optional label.
- **Daily Total**: The sum of focused time for one calendar day, derived from log entries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person can start a focus session within 2 interactions from opening the app.
- **SC-002**: The displayed remaining time is accurate to within 1 second over a full 25-minute session, including after pausing and resuming.
- **SC-003**: 100% of completed focus sessions appear in the log, and 0% of cancelled sessions do.
- **SC-004**: Today's total and each daily total in the last-7-days summary exactly equal the sum of the logged sessions for that day.
- **SC-005**: A person can set a label for a session in under 10 seconds, without it interrupting the end of the session.
- **SC-006**: Every core function (start, pause, resume, cancel, label, view totals) can be done with the keyboard alone.
- **SC-007**: Session and break endings are noticed by the person in a test where sound is muted.
- **SC-008**: Log data survives closing and reopening the app, with no network activity involved.

## Assumptions

- This is a single-user app on one device; there are no accounts or syncing.
- The durations (25, 5, 15 minutes) and the four-session cycle are fixed for this version; customizing them is out of scope.
- Breaks are not logged and do not count toward focused time.
- The next session or break is started by the person rather than automatically, so they stay in control.
- The last-7-days summary is a rolling view of the last 7 days ending today; browsing earlier periods is out of scope.
- Labels are plain text, up to 60 characters.
- Editing or deleting individual log entries is out of scope; only full export and delete are provided.
