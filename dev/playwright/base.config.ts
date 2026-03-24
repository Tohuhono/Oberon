import path from "node:path"
import {
  test as baseTest,
  defineConfig as baseDefineConfig,
  devices,
} from "@playwright/test"

type AuthSetupOptions = {
  serverLog: {
    read: () => Promise<string>
  }
  authEmail?: string
  authStorageStatePath?: string
}

const PLAYWRIGHT_AUTH_EMAIL = "test@tohuhono.com"
const PLAYWRIGHT_AUTH_STATE_PATH = path.resolve(
  process.cwd(),
  ".playwright/storage-state.json",
)

export const test = baseTest.extend<AuthSetupOptions>({
  serverLog: [
    // Empty destructure required for playwright runtime validation
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => use({ read: async () => "" }),
    { option: true },
  ],
  authEmail: [undefined, { option: true }],
  authStorageStatePath: [undefined, { option: true }],
})

export const defineConfig = baseDefineConfig<AuthSetupOptions>

export const base = defineConfig({
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { open: "never", outputFolder: ".playwright/report" }],
      ]
    : "line",
  outputDir: ".playwright/results",
  use: {
    ...devices["Desktop Chrome"],
    trace: "on-first-retry",
    authEmail: PLAYWRIGHT_AUTH_EMAIL,
    authStorageStatePath: PLAYWRIGHT_AUTH_STATE_PATH,
  },
})
