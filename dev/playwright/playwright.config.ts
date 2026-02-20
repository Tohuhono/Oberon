import { base, defineConfig } from "./base.config"

const baseURL = process.env.PLAYWRIGHT_BASE_URL
const vercelProtectionBypass = process.env.VERCEL_PROTECTION_BYPASS || ""

if (!baseURL) {
  throw new Error(
    "PLAYWRIGHT_BASE_URL is required for smoke tests. Set PLAYWRIGHT_BASE_URL before running `pnpm test:smoke`.",
  )
}

export default defineConfig({
  ...base,
  use: {
    ...base.use,
    extraHTTPHeaders: {
      "x-vercel-protection-bypass": vercelProtectionBypass,
      "x-vercel-set-bypass-cookie": "true",
    },
  },
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
