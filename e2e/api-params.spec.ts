import { test, expect } from "@playwright/test";

test.describe("API list endpoints honor query params", () => {
  test("GET /api/v1/terms respects limit", async ({ request }) => {
    const res = await request.get("/api/v1/terms?limit=2");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBeLessThanOrEqual(2);
  });

  test("GET /api/v1/terms q filter narrows results", async ({ request }) => {
    const res = await request.get("/api/v1/terms?q=climate");
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const item of body.items) {
      expect(item.name.toLowerCase()).toContain("climate");
    }
  });

  test("GET /api/v1/frameworks respects limit", async ({ request }) => {
    const res = await request.get("/api/v1/frameworks?limit=2");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBeLessThanOrEqual(2);
  });

  test("GET /api/v1/frameworks q filter narrows results", async ({ request }) => {
    const res = await request.get("/api/v1/frameworks?q=reporting");
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const item of body.items) {
      expect(item.name.toLowerCase()).toContain("reporting");
    }
  });
});
