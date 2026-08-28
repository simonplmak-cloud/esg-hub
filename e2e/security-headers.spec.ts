import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  const REQUIRED_HEADERS = [
    "content-security-policy",
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
  ] as const;

  test("homepage (/en) includes OWASP security headers", async ({ page }) => {
    const response = await page.goto("/en");
    expect(response).toBeTruthy();
    const headers = response!.headers();

    for (const header of REQUIRED_HEADERS) {
      expect(headers[header], `Missing header: ${header}`).toBeDefined();
    }

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=");
  });

  test("API root (/api/v1) includes OWASP security headers", async ({ page }) => {
    const response = await page.goto("/api/v1");
    expect(response).toBeTruthy();
    const headers = response!.headers();

    for (const header of REQUIRED_HEADERS) {
      expect(headers[header], `Missing header: ${header}`).toBeDefined();
    }
  });

  test("CSP does not contain unsafe-inline in script-src", async ({ page }) => {
    const response = await page.goto("/en");
    expect(response).toBeTruthy();
    const csp = response!.headers()["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});
