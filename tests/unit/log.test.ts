import { describe, expect, it } from "vitest";
import { dailyTotalMs, entriesForDay, formatDuration, makeEntry, toCsv } from "../../src/log";
import { FOCUS_MS, MAX_LABEL_LENGTH, type LogEntry } from "../../src/types";

/** Local time, so these tests give the same result in any time zone. */
function local(y: number, m: number, d: number, h = 0, min = 0, s = 0): number {
  return new Date(y, m - 1, d, h, min, s).getTime();
}

describe("makeEntry", () => {
  it("records a 25 minute session ending at the given time", () => {
    const entry = makeEntry(1000, "write");
    expect(entry.durationMs).toBe(FOCUS_MS);
    expect(entry.completedAt).toBe(1000);
    expect(entry.label).toBe("write");
  });

  it("trims the label", () => {
    expect(makeEntry(1000, "  write report  ").label).toBe("write report");
  });

  it("cuts a label longer than 60 characters to 60 characters", () => {
    const entry = makeEntry(1000, "x".repeat(100));
    expect(entry.label).toHaveLength(MAX_LABEL_LENGTH);
  });

  it("keeps an empty label empty", () => {
    expect(makeEntry(1000, "").label).toBe("");
    expect(makeEntry(1000, "   ").label).toBe("");
  });

  it("gives different ids to entries with the same completion time", () => {
    const first = makeEntry(1000, "a");
    const second = makeEntry(1000, "b", [first]);
    expect(second.id).not.toBe(first.id);
  });
});

describe("toCsv", () => {
  const entry = (completedAt: number, label: string): LogEntry => ({
    id: String(completedAt),
    completedAt,
    durationMs: FOCUS_MS,
    label,
  });

  it("starts with the header row", () => {
    expect(toCsv([])).toBe("completed_at,duration_minutes,label\n");
  });

  it("writes one row per entry with local time and minutes", () => {
    const csv = toCsv([entry(local(2026, 11, 13, 9, 5, 7), "write")]);
    expect(csv).toBe("completed_at,duration_minutes,label\n2026-11-13T09:05:07,25,write\n");
  });

  it("writes entries in the order given", () => {
    const csv = toCsv([entry(local(2026, 11, 12, 10), "a"), entry(local(2026, 11, 13, 10), "b")]);
    const rows = csv.trim().split("\n");
    expect(rows[1]).toContain(",a");
    expect(rows[2]).toContain(",b");
  });

  it("writes an empty label as an empty field", () => {
    const csv = toCsv([entry(local(2026, 1, 2, 3, 4, 5), "")]);
    expect(csv).toBe("completed_at,duration_minutes,label\n2026-01-02T03:04:05,25,\n");
  });

  it("quotes labels containing commas, quotes or newlines and doubles the quotes", () => {
    const csv = toCsv([
      entry(local(2026, 1, 1), "a, b"),
      entry(local(2026, 1, 2), 'say "hi"'),
      entry(local(2026, 1, 3), "line1\nline2"),
    ]);
    expect(csv).toContain(',25,"a, b"\n');
    expect(csv).toContain(',25,"say ""hi"""\n');
    expect(csv).toContain(',25,"line1\nline2"\n');
  });

  it("prefixes labels that start with = + - or @ so spreadsheets do not run them as formulas", () => {
    for (const bad of ["=SUM(A1)", "+1", "-1", "@cmd"]) {
      const csv = toCsv([entry(local(2026, 1, 1), bad)]);
      expect(csv).toContain(`,25,'${bad}\n`);
    }
  });
});

describe("entriesForDay and dailyTotalMs", () => {
  const at = (completedAt: number, label = ""): LogEntry => ({
    id: String(completedAt),
    completedAt,
    durationMs: FOCUS_MS,
    label,
  });

  it("lists only the entries completed on that local day", () => {
    const today = at(local(2026, 11, 13, 9), "today");
    const yesterday = at(local(2026, 11, 12, 9), "yesterday");
    const tomorrow = at(local(2026, 11, 14, 9), "tomorrow");
    const result = entriesForDay([yesterday, today, tomorrow], local(2026, 11, 13, 15));
    expect(result).toEqual([today]);
  });

  it("puts 23:59 and 00:01 on different days", () => {
    const late = at(local(2026, 11, 13, 23, 59));
    const early = at(local(2026, 11, 14, 0, 1));
    expect(entriesForDay([late, early], local(2026, 11, 13))).toEqual([late]);
    expect(entriesForDay([late, early], local(2026, 11, 14))).toEqual([early]);
  });

  it("counts a session on the day it finished, not the day it started", () => {
    // Finished just after midnight, so it belongs to the new day.
    const finished = at(local(2026, 11, 14, 0, 10));
    expect(dailyTotalMs([finished], local(2026, 11, 14, 12))).toBe(FOCUS_MS);
    expect(dailyTotalMs([finished], local(2026, 11, 13, 12))).toBe(0);
  });

  it("sums the durations of that day's entries", () => {
    const entries = [at(local(2026, 11, 13, 9)), at(local(2026, 11, 13, 10)), at(local(2026, 11, 12, 10))];
    expect(dailyTotalMs(entries, local(2026, 11, 13))).toBe(2 * FOCUS_MS);
  });

  it("returns zero and an empty list when there are no entries that day", () => {
    expect(dailyTotalMs([], local(2026, 11, 13))).toBe(0);
    expect(entriesForDay([], local(2026, 11, 13))).toEqual([]);
  });
});

describe("formatDuration", () => {
  it("shows minutes only under an hour", () => {
    expect(formatDuration(25 * 60000)).toBe("25 min");
    expect(formatDuration(0)).toBe("0 min");
  });

  it("shows hours and minutes", () => {
    expect(formatDuration(75 * 60000)).toBe("1 h 15 min");
    expect(formatDuration(150 * 60000)).toBe("2 h 30 min");
  });

  it("shows whole hours without minutes", () => {
    expect(formatDuration(60 * 60000)).toBe("1 h");
  });
});
