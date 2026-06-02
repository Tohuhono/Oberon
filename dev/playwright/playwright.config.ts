import { base, defineConfig } from "./base.config"
import { smokeProject } from "./projects"

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
      ...smokeProject,
      name: "playground",
      grepInvert: /@docs/,
    },
    {
      ...smokeProject,
      name: "docs",
      grepInvert: /@playground/,
    },
  ],
})
