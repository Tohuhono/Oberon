import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: [["html", { outputFolder: "./report" }]],
  outputDir: "./results",

  use: {
    ...devices["Desktop Chrome"],
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "playground",
      testMatch: "playground/**/*.spec.ts",
      use: { baseURL: "http://localhost:3200" },
    },
    {
      name: "docs",
      testMatch: "docs/**/*.spec.ts",
      use: { baseURL: "http://localhost:3201" },
    },
  ],

  webServer: [
    {
      command: "pnpm start:oberon",
      url: "http://localhost:3200",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        ...process.env,
        PORT: "3200",
        USE_DEVELOPMENT_DATABASE: "true",
        SQLITE_FILE: "file:.oberon/e2e-test.db",
      },
    },
    {
      command: "pnpm start:docs",
      url: "http://localhost:3201",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        ...process.env,
        PORT: "3201",
      },
    },
  ],
})
