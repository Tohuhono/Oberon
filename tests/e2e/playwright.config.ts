import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: [["html", { outputFolder: "./report" }]],
  outputDir: "./results",

  use: {
    baseURL: "http://localhost:3200",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "pnpm start:oberon",
    url: "http://localhost:3200",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: "3200",
      USE_DEVELOPMENT_DATABASE: "true",
      SQLITE_FILE: "file:.oberon/e2e-test.db",
    },
  },
})
