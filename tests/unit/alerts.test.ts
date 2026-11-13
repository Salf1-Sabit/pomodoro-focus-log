import { describe, expect, it } from "vitest";
import { alertContent, shouldNotify } from "../../src/alerts";

describe("alertContent", () => {
  it("describes a finished focus session", () => {
    const content = alertContent("focus");
    expect(content.message).toMatch(/focus session complete/i);
    expect(content.title).toMatch(/focus/i);
  });

  it("describes a finished short break and a finished long break the same way", () => {
    const short = alertContent("shortBreak");
    const long = alertContent("longBreak");
    expect(short.message).toMatch(/break over/i);
    expect(short).toEqual(long);
  });

  it("gives a title that differs from the page's normal title", () => {
    expect(alertContent("focus").title).not.toBe("Pomodoro Focus Log");
  });
});

describe("shouldNotify", () => {
  it("is true only when notifications are supported and permission is granted", () => {
    expect(shouldNotify("granted", true)).toBe(true);
  });

  it("is false when permission is denied or not yet asked", () => {
    expect(shouldNotify("denied", true)).toBe(false);
    expect(shouldNotify("default", true)).toBe(false);
  });

  it("is false when the browser has no notification support", () => {
    expect(shouldNotify("granted", false)).toBe(false);
    expect(shouldNotify(undefined, false)).toBe(false);
  });
});
