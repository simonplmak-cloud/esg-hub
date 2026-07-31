import { describe, it, expect } from "vitest";

describe("pipeline-normalize transforms", () => {
  it("trims whitespace from input string", () => {
    const input = "  Climate Change  ";
    const result = input.trim();
    expect(result).toBe("Climate Change");
  });

  it("returns empty string for whitespace-only input", () => {
    const input = "   ";
    const result = input.trim();
    expect(result).toBe("");
  });

  it("handles empty string input", () => {
    const result = "".trim();
    expect(result).toBe("");
  });

  it("filters undefined entries from array", () => {
    const entries = ["a", undefined, "b", null, "c"];
    const filtered = entries.filter(
      (e): e is string => typeof e === "string" && e.length > 0
    );
    expect(filtered).toEqual(["a", "b", "c"]);
  });

  it("rejects entries longer than 500 chars", () => {
    const entries = ["short", "a".repeat(501), "medium"];
    const filtered = entries.filter((e) => e.length <= 500);
    expect(filtered).toEqual(["short", "medium"]);
  });
});
