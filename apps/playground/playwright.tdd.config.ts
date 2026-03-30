import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "@dev/playwright"
import { tddProject } from "@dev/playwright/projects"
import playgroundConfig from "./playwright.config"

const APP_LOG_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".playwright/logs/app.log",
)

const command = [
  `rm -f '${APP_LOG_PATH}'`,
  `mkdir -p '${path.dirname(APP_LOG_PATH)}'`,
  `pnpm start > '${APP_LOG_PATH}' 2>&1`,
].join(" && ")

export default defineConfig({
  ...playgroundConfig,
  webServer: {
    ...playgroundConfig.webServer,
    command,
    reuseExistingServer: false,
  },
  use: {
    ...playgroundConfig.use,
    trace: "off",
  },
  projects: [...(playgroundConfig.projects ?? []), tddProject],
})
