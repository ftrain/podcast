import { describe, it, expect } from "vitest";
import { formatBytes, formatDate, STATUS_COLORS } from "../lib/utils";

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(5242880)).toBe("5 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });
});

describe("formatDate", () => {
  it("returns dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("formats a date string", () => {
    const result = formatDate("2025-06-15T00:00:00.000Z");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });
});

describe("STATUS_COLORS", () => {
  it("has colors for all statuses", () => {
    expect(STATUS_COLORS.IDEA).toBe("blue");
    expect(STATUS_COLORS.PLANNED).toBe("cyan");
    expect(STATUS_COLORS.RECORDING).toBe("orange");
    expect(STATUS_COLORS.EDITING).toBe("purple");
    expect(STATUS_COLORS.PUBLISHED).toBe("green");
  });
});
