import { describe, expect, it } from "vitest";
import { loadLog, loadTimer, saveLog, saveTimer, type StorageLike } from "../../src/storage";
import { initialState } from "../../src/timer";
import type { LogEntry } from "../../src/types";

function fakeStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const entry: LogEntry = { id: "a", completedAt: 1000, durationMs: 1500000, label: "write" };

describe("loadTimer", () => {
  it("returns the default state when nothing is stored", () => {
    expect(loadTimer(fakeStorage())).toEqual(initialState());
  });

  it("returns the default state for corrupt JSON without throwing", () => {
    expect(loadTimer(fakeStorage({ "pomodoro.timer.v1": "{not json" }))).toEqual(initialState());
  });

  it("returns the default state for a wrongly shaped value", () => {
    expect(loadTimer(fakeStorage({ "pomodoro.timer.v1": JSON.stringify({ kind: "nope" }) }))).toEqual(initialState());
  });

  it("round-trips a saved state", () => {
    const storage = fakeStorage();
    const state = { ...initialState(), status: "running" as const, endsAt: 5000, label: "x" };
    saveTimer(storage, state);
    expect(loadTimer(storage)).toEqual(state);
  });
});

describe("loadLog", () => {
  it("returns an empty log when nothing is stored", () => {
    expect(loadLog(fakeStorage())).toEqual([]);
  });

  it("returns an empty log for corrupt JSON", () => {
    expect(loadLog(fakeStorage({ "pomodoro.log.v1": "oops" }))).toEqual([]);
  });

  it("returns an empty log when the stored value is not an array", () => {
    expect(loadLog(fakeStorage({ "pomodoro.log.v1": JSON.stringify({ a: 1 }) }))).toEqual([]);
  });

  it("drops invalid entries and keeps valid ones", () => {
    const stored = JSON.stringify([entry, { id: 5 }, null, { ...entry, id: "b", durationMs: -1 }]);
    expect(loadLog(fakeStorage({ "pomodoro.log.v1": stored }))).toEqual([entry]);
  });

  it("round-trips a saved log", () => {
    const storage = fakeStorage();
    saveLog(storage, [entry]);
    expect(loadLog(storage)).toEqual([entry]);
  });
});

describe("saving", () => {
  it("reports failure instead of throwing when setItem throws", () => {
    const broken: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };
    expect(saveLog(broken, [entry])).toBe(false);
    expect(saveTimer(broken, initialState())).toBe(false);
  });

  it("reports success when the write works", () => {
    expect(saveLog(fakeStorage(), [entry])).toBe(true);
  });
});
