import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { base, defineConfig } from "@dev/playwright"
import { authProject, authenticatedProject } from "@dev/playwright/projects"

const PLAYWRIGHT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".playwright")

const APP_LOG_DIR = path.resolve(PLAYWRIGHT_DIR, "logs")

const APP_LOG_PATH = path.resolve(APP_LOG_DIR, "app.log")

async function readTanstackLogs() {
  return await readFile(APP_LOG_PATH, "utf8")
}

export default defineConfig({
  ...base,
  webServer: {
    command: [
      `rm -rf '${APP_LOG_DIR}'`,
      `mkdir -p '${APP_LOG_DIR}'`,
      `pnpm preview --port 3220 > '${APP_LOG_PATH}' 2>&1`,
    ].join(" && "),
    url: "http://localhost:3220",
    reuseExistingServer: false,
    stderr: "pipe",
    stdout: "pipe",
    env: {
      PORT: "3220",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    },
  },
  use: {
    ...base.use,
    baseURL: "http://localhost:3220",
    serverLog: {
      read: readTanstackLogs,
    },
  },
  projects: [
    { ...authProject, grepInvert: /@docs/ },
    { ...authenticatedProject, grepInvert: /@docs/ },
  ],
})
