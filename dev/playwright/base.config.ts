import { defineConfig, devices } from "@playwright/test"

export const base = defineConfig({
  testMatch: "test/**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: [["html", { outputFolder: ".playwright/report" }]],
  outputDir: ".playwright/results",
  use: {
    ...devices["Desktop Chrome"],
    trace: "on-first-retry",
  },
})

export { defineConfig }
