import {
  test as baseTest,
  defineConfig as baseDefineConfig,
  devices,
} from "@playwright/test"

type AuthSetupOptions = {
  readLog: () => Promise<string>
  authEmail?: string
  authStorageStatePath?: string
}

export const test = baseTest.extend<AuthSetupOptions>({
  readLog: [
    async (_, use) =>
      use(async () => {
        throw new Error("authHelpers.readLog fixture option must be provided")
      }),
    { option: true },
  ],
  authEmail: [undefined, { option: true }],
  authStorageStatePath: [undefined, { option: true }],
})

export const defineConfig = baseDefineConfig<AuthSetupOptions>

export const base = defineConfig({
  testMatch: "test/**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: "line",
  outputDir: ".playwright/results",
  use: {
    ...devices["Desktop Chrome"],
    trace: "on-first-retry",
  },
})
