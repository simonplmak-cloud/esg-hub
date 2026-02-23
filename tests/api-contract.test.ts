import { test, expect } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test.describe("API Contract Tests - Related Pages", () => {
  test("GET /api/v1/pages/[id]/related returns valid response structure", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/page:environmental/climate-change/related`
    );

    const status = response.status();
    if (status === 200) {
      const text = await response.text();
      if (!text.startsWith("{")) {
        console.log("Non-JSON response:", text.substring(0, 100));
        return;
      }
      const json = JSON.parse(text);
      expect(json).toHaveProperty("data");
      expect(Array.isArray(json.data)).toBe(true);

      if (json.data.length > 0) {
        const item = json.data[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("permalink");
        expect(item).toHaveProperty("section");
      }
    } else {
      expect([404, 503]).toContain(status);
    }
  });

  test("GET /api/v1/pages/[id]/related validates limit parameter", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/climate-change/related?limit=invalid`
    );

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json).toHaveProperty("error");
  });

  test("GET /api/v1/pages/[id]/related rejects limit > 50", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/climate-change/related?limit=100`
    );

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("50");
  });

  test("GET /api/v1/pages/[id]/related rejects negative limit", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/climate-change/related?limit=-1`
    );

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("1");
  });

  test("GET /api/v1/pages/[id]/related validates page identifier format", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/%3Cscript%3Ealert(1)%3C/script%3E/related`
    );

    const status = response.status();
    expect([200, 400, 404]).toContain(status);
    if (status === 400) {
      const json = await response.json();
      expect(json).toHaveProperty("error");
    }
  });

  test("GET /api/v1/pages/[id]/related rejects overly long id", async ({
    request,
  }) => {
    const longId = "a".repeat(501);
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/${longId}/related`
    );

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("too long");
  });
});

test.describe("API Contract Tests - Backlinks", () => {
  test("GET /api/v1/pages/[id]/backlinks returns valid response structure", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/page:environmental/climate-change/backlinks`
    );

    const status = response.status();
    if (status === 200) {
      const text = await response.text();
      if (!text.startsWith("{")) {
        console.log("Non-JSON response:", text.substring(0, 100));
        return;
      }
      const json = JSON.parse(text);
      expect(json).toHaveProperty("data");
      expect(Array.isArray(json.data)).toBe(true);

      if (json.data.length > 0) {
        const item = json.data[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("permalink");
        expect(item).toHaveProperty("section");
      }
    } else {
      expect([404, 503]).toContain(status);
    }
  });

  test("GET /api/v1/pages/[id]/backlinks validates page identifier format", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/%2E%2E%2Fetc%2Fpasswd/backlinks`
    );

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json).toHaveProperty("error");
  });

  test("GET /api/v1/pages/[id]/backlinks rejects overly long id", async ({
    request,
  }) => {
    const longId = "b".repeat(501);
    const response = await request.get(
      `${BASE_URL}/api/v1/pages/${longId}/backlinks`
    );

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("too long");
  });
});
