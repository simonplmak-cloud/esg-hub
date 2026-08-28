import { describe, it, expect } from "vitest";
import { parseListParams } from "@/lib/list-params";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function makeParams(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("parseListParams", () => {
  it("returns defaults when no params provided", () => {
    const p = parseListParams(makeParams(""));
    expect(p).toEqual({ limit: 20, offset: 0, q: "" });
  });

  it("clamps limit to [1, 100]", () => {
    expect(parseListParams(makeParams("limit=0")).limit).toBe(1);
    expect(parseListParams(makeParams("limit=500")).limit).toBe(100);
    expect(parseListParams(makeParams("limit=abc")).limit).toBe(20);
  });

  it("clamps offset to non-negative", () => {
    expect(parseListParams(makeParams("offset=-5")).offset).toBe(0);
    expect(parseListParams(makeParams("offset=999999")).offset).toBe(100000);
    expect(parseListParams(makeParams("offset=nan")).offset).toBe(0);
  });

  it("trims and sanitizes q", () => {
    expect(parseListParams(makeParams("q=  climate   ")).q).toBe("climate");
    expect(parseListParams(makeParams("q=it's")).q).toBe("it\\'s");
  });
});

describe("terms/frameworks route static-cache regression guard", () => {
  const routes = [
    join(process.cwd(), "src/app/api/v1/terms/route.ts"),
    join(process.cwd(), "src/app/api/v1/frameworks/route.ts"),
  ];

  for (const route of routes) {
    it(`${route.split("/").slice(-2).join("/")} does not export force-static or revalidate`, () => {
      const src = readFileSync(route, "utf8");
      expect(src).not.toMatch(/export const dynamic = "force-static"/);
      expect(src).not.toMatch(/export const revalidate/);
    });
  }
});
