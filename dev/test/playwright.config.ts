import { defineConfig, devices } from "@playwright/test"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const isDeployedTarget = process.env.PLAYWRIGHT_TARGET === "deployed"
const playgroundBaseURL =
  process.env.PLAYWRIGHT_PLAYGROUND_BASE_URL ?? "http://localhost:3200"
const docsBaseURL =
  process.env.PLAYWRIGHT_DOCS_BASE_URL ?? "http://localhost:3201"

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
      use: { baseURL: playgroundBaseURL },
    },
    {
      name: "docs",
      testMatch: "docs/**/*.spec.ts",
      use: { baseURL: docsBaseURL },
    },
  ],

  webServer: isDeployedTarget
    ? undefined
    : [
        {
          command: "pnpm start:oberon",
          cwd: repoRoot,
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
          cwd: repoRoot,
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
