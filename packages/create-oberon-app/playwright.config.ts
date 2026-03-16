import { base, defineConfig } from "@dev/playwright"

export default defineConfig({
  ...base,
  globalSetup: "./test/global-setup.ts",
  testDir: "../..",
  use: { ...base.use, baseURL: "http://localhost:3000" },
  projects: [
    {
      name: "scaffold",
      testMatch: "apps/playground/test/smoke.spec.ts",
    },
  ],
})
