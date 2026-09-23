import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { base, defineConfig } from "@dev/playwright"
import { authProject, authenticatedProject } from "@dev/playwright/projects"

const PLAYWRIGHT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".playwright")

const APP_LOG_DIR = path.resolve(PLAYWRIGHT_DIR, "logs")

const APP_LOG_PATH = path.resolve(APP_LOG_DIR, "app.log")
const baseURL = "http://localhost:3210"

async function readNextjsLogs() {
  try {
    return await readFile(APP_LOG_PATH, "utf8")
  } catch {
    return ""
  }
}

export default defineConfig({
  ...base,
  webServer: {
    command: [
      `rm -rf '${APP_LOG_DIR}'`,
      `mkdir -p '${APP_LOG_DIR}'`,
      `pnpm start -p 3210 > '${APP_LOG_PATH}' 2>&1`,
    ].join(" && "),
    url: baseURL,
    reuseExistingServer: false,
    stderr: "pipe",
    stdout: "pipe",
    env: {
      BETTER_AUTH_URL: baseURL,
    },
  },
  use: {
    ...base.use,
    baseURL,
    serverLog: {
      read: readNextjsLogs,
    },
  },
  projects: [
    { ...authProject, grepInvert: /@docs/ },
    { ...authenticatedProject, grepInvert: /@docs/ },
  ],
})
