import { describe, it, expect, beforeEach } from "vitest";
import { validateWriteToken, requireWriteToken } from "@/lib/auth/write-token";

describe("validateWriteToken", () => {
  beforeEach(() => {
    process.env.ESG_HUB_WRITE_TOKEN = "test-token-123";
  });

  function makeRequest(auth?: string): Request {
    const headers = new Headers();
    if (auth) headers.set("authorization", auth);
    return new Request("https://example.com/api/v1/terms", { headers });
  }

  it("valid Bearer token returns true", () => {
    expect(validateWriteToken(makeRequest("Bearer test-token-123"))).toBe(true);
  });

  it("missing Authorization header returns false", () => {
    expect(validateWriteToken(makeRequest())).toBe(false);
  });

  it("wrong prefix returns false", () => {
    expect(validateWriteToken(makeRequest("Basic test-token-123"))).toBe(false);
  });

  it("empty token returns false", () => {
    expect(validateWriteToken(makeRequest("Bearer "))).toBe(false);
  });

  it("case mismatch returns false", () => {
    expect(validateWriteToken(makeRequest("Bearer TEST-TOKEN-123"))).toBe(false);
  });

  it("extra whitespace in header value", () => {
    expect(validateWriteToken(makeRequest("  Bearer test-token-123  "))).toBe(true);
  });

  it("env var not set returns false", () => {
    delete (process.env as Record<string, string | undefined>).ESG_HUB_WRITE_TOKEN;
    expect(validateWriteToken(makeRequest("Bearer anything"))).toBe(false);
    process.env.ESG_HUB_WRITE_TOKEN = "test-token-123";
  });
});

describe("requireWriteToken", () => {
  beforeEach(() => {
    process.env.ESG_HUB_WRITE_TOKEN = "secret";
  });

  it("returns null on valid token", () => {
    const req = new Request("https://example.com/api/v1/terms", {
      headers: new Headers({ authorization: "Bearer secret" }),
    });
    expect(requireWriteToken(req)).toBeNull();
  });

  it("returns 401 Response on invalid token", () => {
    const req = new Request("https://example.com/api/v1/terms", {
      headers: new Headers({ authorization: "Bearer wrong" }),
    });
    const res = requireWriteToken(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
    expect(res!.headers.get("WWW-Authenticate")).toContain("Bearer");
  });

  it("returns 401 Response on missing header", () => {
    const req = new Request("https://example.com/api/v1/terms");
    const res = requireWriteToken(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });
});
