# Pomodoro Focus Log Constitution

## Core Principles

### I. Simplicity First
Use the fewest dependencies and the simplest architecture that satisfies the spec.
- A dependency MUST be justified in the plan; prefer the platform standard library or built-ins.
- No feature, setting, or abstraction may be added unless a user story in the spec requires it.
- Prefer one obvious way to do something over configurable or layered designs.

Rationale: this is a small personal app; every extra dependency or feature is ongoing
maintenance cost with no matching benefit.

### II. Test-Backed Core Behavior (NON-NEGOTIABLE)
Core behavior MUST have automated tests before a feature counts as done.
- Timer logic (start, pause, resume, reset, work/break transitions, completion) MUST be tested.
- Focus-log totals (per day, per period, per category where specified) MUST be tested.
- Timer logic MUST be testable without real waiting (injectable clock or equivalent).
- A feature is not done, and its tasks MUST NOT be marked complete, while these tests are
  missing or failing.

Rationale: timer and total errors silently corrupt the user's record of their own time.

### III. Clear, Accessible Interface
The interface MUST be clear and consistent across all screens.
- Every control MUST be operable by keyboard, with a visible focus indicator and logical tab order.
- Controls MUST have accessible names/labels; state changes (e.g. timer running, session
  complete) MUST NOT rely on color or sound alone.
- Text and controls MUST meet WCAG AA contrast (4.5:1 for body text, 3:1 for large text and UI).
- The same action MUST look and behave the same everywhere (labels, placement, shortcuts).

Rationale: a tool used daily must be usable by everyone, without a mouse, in any lighting.

### IV. Private, Local-First Data
The person's data is private and belongs to them.
- Data MUST be stored locally on the user's device by default.
- Data MUST NOT be transmitted to any other service or location (including analytics,
  telemetry, and crash reporting) unless an explicit spec requirement says so.
- Any approved transmission MUST be opt-in and documented in the spec.
- The user MUST be able to export or delete their data.

Rationale: focus logs reveal personal habits; trust requires that nothing leaves without consent.

### V. Plain, Readable Code
Code MUST favor clarity over cleverness.
- Use descriptive names, small functions, and straightforward control flow.
- Avoid clever tricks, deep abstraction, and premature optimization.
- Comments explain why, not what; non-obvious decisions MUST be commented.

Rationale: a future reader (often the author) must understand the code quickly.

## Technology & Scope Constraints

- Scope is limited to a Pomodoro timer and a focus log; anything else needs a spec change first.
- Stack choices MUST follow Principle I and be recorded in the plan with a short justification.
- No accounts, network services, or remote storage unless a spec requirement mandates them
  (see Principle IV).

## Development Workflow & Commits

- Make small, meaningful commits as work progresses; each commit MUST be one logical change
  that leaves the project in a working state.
- Commit messages MUST follow Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`,
  `refactor:`, `chore:`), with an imperative subject of about 50 characters or fewer, and a
  body explaining why when the change is not obvious.
- Commits MUST NOT mix unrelated changes, and MUST NOT include secrets or generated artifacts.
- Commit messages and pull request descriptions MUST NOT include a "Co-Authored-By: Claude"
  line or any other AI co-author or attribution trailer.
- Work happens on short-lived branches; the main branch MUST stay passing.
- Before merge, tests for timer logic and log totals MUST pass.

## Governance

This constitution supersedes other practices for this project. Amendments MUST be written in
this file, state the reason, and update the version and amended date. Versioning follows
semantic versioning: MAJOR for removing or redefining principles, MINOR for adding a
principle/section or materially expanding guidance, PATCH for clarifications and wording.
Specs, plans, and tasks MUST be checked against this constitution; any deviation (e.g. an
added dependency) MUST be justified in the plan. Compliance is reviewed at each plan and
before each feature is marked done.

**Version**: 1.0.0 | **Ratified**: 2026-11-13 | **Last Amended**: 2026-11-13
