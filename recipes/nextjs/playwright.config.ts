import { resolve } from "path"
import { defineConfig, devices } from "@playwright/experimental-ct-react"
import react from "@vitejs/plugin-react"

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./src",
  testMatch: "@(app|components)/**/*.spec.?(c|m)[jt]s?(x)",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 3,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { outputFolder: "./test/playwright/report" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_URL || "http://localhost:3000",
    extraHTTPHeaders: {
      "req-source": process.env.PLAYWRIGHT_HEADER || "playwright",
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    ctTemplateDir: "test/playwright",
    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,
    ctViteConfig: {
      plugins: [react()],
      resolve: {
        alias: {
          "@": resolve(__dirname, "./src"),
        },
      },
    },
  },

  outputDir: "./test/playwright/results",

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "chrome-mobile",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "safari-mobile",
      use: { ...devices["iPhone 12"] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ..devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  webServer:
    process.env.PLAYWRIGHT_DEV_SERVER === "true"
      ? /* Run your local dev server before starting the tests */
        // {
        //   command: 'npm run start',
        //   url: 'http://127.0.0.1:3000',
        //   reuseExistingServer: !process.env.CI,
        // }
        undefined
      : undefined,
})
