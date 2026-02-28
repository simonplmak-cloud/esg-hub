import { test, expect } from "@playwright/test";

test.describe("Locale Routing", () => {
  test("root redirects to /en/", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test("locale homepages load correctly", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1").first()).toContainText("ESG Hub");

    await page.goto("/zh");
    await expect(page.locator("h1").first()).toContainText("ESG");

    await page.goto("/hi");
    await expect(page.locator("h1").first()).toContainText("ESG");
  });

  test("content pages load with locale", async ({ page }) => {
    await page.goto("/en/environmental");
    await expect(page.locator("h1").first()).toBeVisible();

    await page.goto("/zh/environmental");
    await expect(page.locator("h1").first()).toBeVisible();

    await page.goto("/hi/environmental");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("static pages work with locale - search", async ({ page }) => {
    await page.goto("/en/search");
    await expect(page.locator("h1").first()).toContainText("Search");

    // Non-English locales render translated headings — verify page loads, not text
    await page.goto("/zh/search");
    await expect(page.locator("h1").first()).toBeVisible();

    await page.goto("/hi/search");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("static pages work with locale - books", async ({ page }) => {
    await page.goto("/en/books");
    await expect(page.locator("h1").first()).toContainText("ESG Literature");

    // Non-English locales render translated headings — verify page loads, not text
    await page.goto("/zh/books");
    await expect(page.locator("h1").first()).toBeVisible();

    await page.goto("/hi/books");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("static pages work with locale - videos", async ({ page }) => {
    await page.goto("/en/videos");
    await expect(page.locator("h1").first()).toContainText("ESG Video Library");

    // Non-English locales render translated headings — verify page loads, not text
    await page.goto("/zh/videos");
    await expect(page.locator("h1").first()).toBeVisible();

    await page.goto("/hi/videos");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("static pages work with locale - contents", async ({ page }) => {
    await page.goto("/en/contents");
    await expect(page.locator("h1").first()).toContainText("Contents");

    // Non-English locales render translated headings — verify page loads, not text
    await page.goto("/zh/contents");
    await expect(page.locator("h1").first()).toBeVisible();

    await page.goto("/hi/contents");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("language switcher changes locale", async ({ page }) => {
    await page.goto("/en");
    
    // Click on the language dropdown button (has flag emoji)
    const langButton = page.locator('button').filter({ hasText: /🇺🇸/ }).first();
    await langButton.click();
    
    // Wait for dropdown and click Chinese option
    await page.waitForTimeout(500);
    const chineseOption = page.locator('button').filter({ hasText: /🇨🇳/ }).first();
    await chineseOption.click();
    
    // Should redirect to /zh
    await expect(page).toHaveURL(/\/zh\/?$/);
  });

  test("page not found shows correct message", async ({ page }) => {
    await page.goto("/en/nonexistent-page-xyz");
    await expect(page.locator("h1").filter({ hasText: "Page Not Found" })).toBeVisible();
  });

  test("developers pages load with locale", async ({ page }) => {
    await page.goto("/en/developers");
    await expect(page.locator("h1").first()).toContainText("Developers");

    await page.goto("/zh/developers");
    await expect(page.locator("h1").first()).toContainText("Developers");

    await page.goto("/hi/developers");
    await expect(page.locator("h1").first()).toContainText("Developers");
  });
});
