import { describe, it, expect } from "vitest";
import { isJunkKeyword, isSuspiciousTerm } from "../../../scripts/lib/term-quality.mjs";

describe("isJunkKeyword", () => {
  it("rejects parenthetical fragments", () => {
    expect(isJunkKeyword("(Carbon")).toBe(true);
    expect(isJunkKeyword("(Planetary")).toBe(true);
  });

  it("rejects pure-digit / digit-led tokens", () => {
    expect(isJunkKeyword("14001")).toBe(true);
    expect(isJunkKeyword("2030 targets")).toBe(true);
  });

  it("rejects symbol-only tokens", () => {
    expect(isJunkKeyword("_")).toBe(true);
    expect(isJunkKeyword("---")).toBe(true);
  });

  it("rejects out-of-length tokens", () => {
    expect(isJunkKeyword("ab")).toBe(true);
    expect(isJunkKeyword("x".repeat(80))).toBe(true);
  });

  it("accepts real glossary terms", () => {
    expect(isJunkKeyword("Climate Change")).toBe(false);
    expect(isJunkKeyword("Greenhouse Gas Protocol")).toBe(false);
    expect(isJunkKeyword("SBTi Net Zero")).toBe(false);
  });
});

describe("isSuspiciousTerm", () => {
  it("flags placeholder definitions", () => {
    expect(isSuspiciousTerm("Carbon", "Carbon — ESG Hub glossary term")).toBe(true);
  });

  it("flags non-letter-led names", () => {
    expect(isSuspiciousTerm("1.5C", "A climate target")).toBe(true);
  });

  it("flags empty definitions", () => {
    expect(isSuspiciousTerm("Carbon", "  ")).toBe(true);
  });

  it("accepts a real definition", () => {
    expect(isSuspiciousTerm("Carbon", "A chemical element fundamental to climate accounting.")).toBe(false);
  });
});
