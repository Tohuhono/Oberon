import { base, defineConfig } from "./base.config"

const baseURL = process.env.PLAYWRIGHT_BASE_URL

if (!baseURL) {
  throw new Error(
    "PLAYWRIGHT_BASE_URL is required for smoke tests. Set PLAYWRIGHT_BASE_URL before running `pnpm test:smoke`.",
  )
}

export default defineConfig({
  ...base,
  testDir: "../..",
  testMatch: "apps/**/test/**/*.spec.ts",
  projects: [
    {
      name: "playground",
      testMatch: "apps/playground/test/**/*.spec.ts",
      use: { baseURL },
    },
    {
      name: "docs",
      testMatch: "apps/documentation/test/**/*.spec.ts",
      use: { baseURL },
    },
  ],
})
