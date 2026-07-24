import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/middleware/rate-limit";

function makeRequest(ip: string): Request {
  return new Request("https://example.com/api/v1/terms", {
    headers: new Headers({ "x-forwarded-for": ip }),
  });
}

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });
  afterEach(() => { vi.useRealTimers(); });

  it("first request passes", () => {
    const result = checkRateLimit(makeRequest("1.2.3.4"));
    expect(result.rateLimited).toBe(false);
    expect(result.remaining).toBe(49);
  });

  it("50th request hits limit", () => {
    for (let i = 0; i < 49; i++) checkRateLimit(makeRequest("1.2.3.4"));
    const result = checkRateLimit(makeRequest("1.2.3.4"));
    expect(result.rateLimited).toBe(true);
  });

  it("request 51 fails", () => {
    for (let i = 0; i < 50; i++) checkRateLimit(makeRequest("1.2.3.4"));
    const result = checkRateLimit(makeRequest("1.2.3.4"));
    expect(result.rateLimited).toBe(true);
  });

  it("window resets after 5 minutes", () => {
    for (let i = 0; i < 50; i++) checkRateLimit(makeRequest("1.2.3.4"));
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    const result = checkRateLimit(makeRequest("1.2.3.4"));
    expect(result.rateLimited).toBe(false);
  });

  it("different IPs get independent limits", () => {
    for (let i = 0; i < 50; i++) checkRateLimit(makeRequest("1.2.3.4"));
    expect(checkRateLimit(makeRequest("1.2.3.4")).rateLimited).toBe(true);
    expect(checkRateLimit(makeRequest("5.6.7.8")).rateLimited).toBe(false);
  });

  it("remaining decreases correctly", () => {
    expect(checkRateLimit(makeRequest("10.0.0.1")).remaining).toBe(49);
    expect(checkRateLimit(makeRequest("10.0.0.1")).remaining).toBe(48);
    expect(checkRateLimit(makeRequest("10.0.0.1")).remaining).toBe(47);
  });
});
