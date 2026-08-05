import { describe, expect, it } from "vitest";

import { formatDisplayDate } from "@/utils/date";

describe("formatDisplayDate", () => {
  it("formats an ISO calendar date as DD-MM-YYYY", () => {
    expect(formatDisplayDate("2026-08-03")).toBe("03-08-2026");
  });

  it("returns an unexpected value unchanged", () => {
    expect(formatDisplayDate("not-a-date")).toBe("not-a-date");
  });
});
