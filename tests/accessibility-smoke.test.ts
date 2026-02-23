import { test, expect, type Page } from "@playwright/test";

interface AccessibilityViolation {
  id: string;
  message: string;
  impact: string;
}

test.describe("Accessibility Smoke Tests", () => {
  const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

  async function checkAccessibility(page: Page): Promise<{ violations: AccessibilityViolation[] }> {
    const violations: AccessibilityViolation[] = [];

    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      const ariaHidden = await img.getAttribute("aria-hidden");
      const src = await img.getAttribute("src");
      
      if (ariaHidden === "true") continue;
      
      if (!alt || alt.trim() === "") {
        violations.push({
          id: "img-missing-alt",
          message: `Image missing alt text: ${src || "unknown"}`,
          impact: "critical"
        });
      }
    }

    const links = await page.locator("a").all();
    for (const link of links) {
      const text = await link.textContent();
      const href = await link.getAttribute("href");
      if (!text || text.trim() === "") {
        violations.push({
          id: "link-empty-text",
          message: `Link with no text: ${href || "unknown"}`,
          impact: "serious"
        });
      }
    }

    const buttons = await page.locator("button").all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      if ((!text || text.trim() === "") && !ariaLabel) {
        const html = await button.innerHTML();
        violations.push({
          id: "button-no-label",
          message: `Button has no accessible name: ${html.substring(0, 50)}`,
          impact: "serious"
        });
      }
    }

    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    let lastLevel = 0;
    for (const heading of headings) {
      const tag = await heading.evaluate((el) => el.tagName.toLowerCase());
      const currentLevel = parseInt(tag.replace("h", ""));
      if (currentLevel > lastLevel + 1 && lastLevel !== 0) {
        violations.push({
          id: "heading-skip-level",
          message: `Heading level skipped: h${lastLevel} -> h${currentLevel}`,
          impact: "moderate"
        });
      }
      lastLevel = currentLevel;
    }

    return { violations };
  }

  test("Home page has no critical accessibility violations", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/ESG/i);

    const { violations } = await checkAccessibility(page);

    if (violations.length > 0) {
      console.log("Violations found:", JSON.stringify(violations, null, 2));
    }

    const criticalViolations = violations.filter(v => v.impact === "critical");
    expect(criticalViolations).toHaveLength(0);
  });

  test("Contents page has no critical accessibility violations", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/contents`);

    const { violations } = await checkAccessibility(page);
    const criticalViolations = violations.filter(v => v.impact === "critical");
    expect(criticalViolations).toHaveLength(0);
  });

  test("Article page has no critical accessibility violations", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/environmental/climate-change`);

    const { violations } = await checkAccessibility(page);
    const criticalViolations = violations.filter(v => v.impact === "critical");
    expect(criticalViolations).toHaveLength(0);
  });

  test("Videos page has no critical accessibility violations", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/videos`);

    const { violations } = await checkAccessibility(page);
    const criticalViolations = violations.filter(v => v.impact === "critical");
    expect(criticalViolations).toHaveLength(0);
  });

  test("Header navigation is accessible", async ({ page }) => {
    await page.goto(BASE_URL);

    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();

    const { violations } = await checkAccessibility(page);
    const criticalViolations = violations.filter(v => v.impact === "critical");
    expect(criticalViolations).toHaveLength(0);
  });

  test("PageToolsSidebar is accessible", async ({ page }) => {
    await page.goto(`${BASE_URL}/environmental/climate-change`);

    const sidebar = page.locator("[class*='PageToolsSidebar']");
    if (await sidebar.isVisible()) {
      const { violations } = await checkAccessibility(page);
      const criticalViolations = violations.filter(v => v.impact === "critical");
      expect(criticalViolations).toHaveLength(0);
    }
  });
});
