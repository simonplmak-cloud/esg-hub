import { describe, it, expect } from "vitest";
import { createLogger, redact } from "@/lib/logger";

describe("logger", () => {
  it("createLogger returns info, warn, error methods", () => {
    const log = createLogger("test");
    expect(typeof log.info).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.error).toBe("function");
  });

  it("log methods do not throw", () => {
    const log = createLogger("test");
    expect(() => log.info("test message")).not.toThrow();
    expect(() => log.warn("test warning")).not.toThrow();
    expect(() => log.error("test error")).not.toThrow();
  });

  it("log methods accept optional data", () => {
    const log = createLogger("test");
    expect(() =>
      log.info("with data", { key: "value", num: 42 })
    ).not.toThrow();
  });
});

describe("redact", () => {
  it("redacts long strings", () => {
    const result = redact("very-long-api-key-that-should-be-hidden");
    expect(result).not.toContain("api-key");
    expect(result).toMatch(/^very...dden$/);
  });

  it("redacts short strings with placeholder", () => {
    const result = redact("ab");
    expect(result).toBe("[redacted]");
  });
});
