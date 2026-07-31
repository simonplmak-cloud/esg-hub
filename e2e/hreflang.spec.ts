import { test, expect } from "@playwright/test";

test.describe("Hreflang & SEO Metadata", () => {
  test("locale page emits correct hreflang alternate links", async ({ page }) => {
    await page.goto("/en");

    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const hrefs = await hreflangLinks.evaluateAll((links) =>
      links.map((el) => ({
        hreflang: el.getAttribute("hreflang"),
        href: el.getAttribute("href"),
      }))
    );

    const byLang = Object.fromEntries(hrefs.map((h) => [h.hreflang, h.href]));

    expect(byLang["en"]).toContain("/en");
    expect(byLang["zh"]).toContain("/zh");
    expect(byLang["hi"]).toContain("/hi");
    expect(byLang["x-default"]).toContain("/en");
  });

  test("canonical URL points to self", async ({ page }) => {
    await page.goto("/en/environmental/climate-change");
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute("href");
    expect(href).toContain("/en/environmental/climate-change");
  });

  test("content-language meta tag is present", async ({ page }) => {
    await page.goto("/en");
    const meta = page.locator('meta[http-equiv="content-language"]');
    const content = await meta.getAttribute("content");
    expect(content).toBe("en");
  });

  test("zh locale has correct hreflang", async ({ page }) => {
    await page.goto("/zh");
    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("hi locale has correct hreflang", async ({ page }) => {
    await page.goto("/hi");
    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
