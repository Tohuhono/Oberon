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
  projects: [
    {
      name: "playground",
      testDir: "../../apps/playground/test",
      grep: /@smoke/,
      use: { baseURL },
    },
    {
      name: "docs",
      testDir: "../../apps/documentation/test",
      grep: /@smoke/,
      use: { baseURL },
    },
  ],
})
