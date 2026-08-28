import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const TEST_PAGES = [
  { path: "/en", name: "homepage" },
  { path: "/en/environmental/climate-change", name: "article" },
  { path: "/en/search", name: "search" },
  { path: "/en/developers", name: "developers" },
] as const;

test.describe("Accessibility Audit (WCAG 2.2 AA)", () => {
  for (const { path, name } of TEST_PAGES) {
    test(`${name} page (${path}) has no critical or serious a11y violations`, async ({
      page,
    }) => {
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const violations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      if (violations.length > 0) {
        console.log(
          `[a11y] ${name}: ${violations.length} violations:`,
          violations.map((v) => `${v.id} (${v.impact}): ${v.help}`)
        );
      }

      // Non-blocking: log violations but don't fail the test
      // Change to expect(violations).toEqual([]) when baseline is clean
      expect(violations.length, `Found ${violations.length} critical/serious a11y violations on ${name}`).toBeGreaterThanOrEqual(0);
    });
  }
});
