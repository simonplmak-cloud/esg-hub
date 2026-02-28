import { defineConfig, devices } from "@playwright/test";

// In CI, tests run against the live Vercel deployment URL passed via BASE_URL.
// Locally, a server is started automatically.
const baseURL = process.env.BASE_URL || "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Only start a local server when not in CI (CI uses the live Vercel URL)
  ...(process.env.CI
    ? {}
    : {
        webServer: {
          // standalone output requires node .next/standalone/server.js;
          // use next dev for local E2E to avoid needing a prior build
          command: "npx next dev -p 3001",
          url: "http://localhost:3001",
          reuseExistingServer: true,
          timeout: 120000,
        },
      }),
});
