import { base, defineConfig } from "@dev/playwright"
import { smokeProject } from "@dev/playwright/projects"

export default defineConfig({
  ...base,
  use: { ...base.use, baseURL: "http://localhost:3201" },
  webServer: {
    command: "pnpm start -p 3201",
    url: "http://localhost:3201",
  },
  projects: [{ ...smokeProject, grepInvert: /@cms/ }],
})
