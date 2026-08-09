import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateTime,
  isValidTimeRange,
} from "./dateTime";

describe("date-only formatting", () => {
  it("does not shift a calendar date into the previous day", () => {
    expect(formatDate("2026-08-08")).toBe("08/08/2026");
    expect(formatDate("2026-01-01")).toBe("01/01/2026");
  });

  it("keeps the same date when formatting an appointment", () => {
    expect(formatDateTime("2026-08-08", "12:00:00")).toBe(
      "08/08/2026 at 12:00 PM",
    );
  });
});

describe("appointment time ranges", () => {
  it("requires the end time to be later than the start time", () => {
    expect(isValidTimeRange("12:00", "13:00")).toBe(true);
    expect(isValidTimeRange("13:00", "12:00")).toBe(false);
    expect(isValidTimeRange("12:00", "12:00")).toBe(false);
  });
});
