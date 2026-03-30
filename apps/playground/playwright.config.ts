import path from "node:path"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { randomBytes } from "crypto"
import { base, defineConfig } from "@dev/playwright"
import {
  authProject,
  authenticatedProject,
  loginProject,
  smokeProject,
} from "@dev/playwright/projects"

const PLAYWRIGHT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".playwright",
)
const APP_LOG_PATH = path.resolve(PLAYWRIGHT_DIR, "logs/app.log")
const AUTH_SECRET = `${randomBytes(64).toString("hex")}`

async function readNextjsLogs() {
  try {
    return await readFile(APP_LOG_PATH, "utf8")
  } catch {
    return ""
  }
}

export default defineConfig({
  ...base,
  testDir: "../..",
  webServer: {
    command: [
      `rm -f '${APP_LOG_PATH}'`,
      `mkdir -p '${path.dirname(APP_LOG_PATH)}'`,
      `pnpm build && pnpm start > '${APP_LOG_PATH}' 2>&1`,
    ].join(" && "),
    url: "http://localhost:3210",
    reuseExistingServer: false,
    stderr: "pipe",
    stdout: "pipe",
    env: {
      PORT: "3210",
      USE_DEVELOPMENT_DATABASE: "true",
      USE_DEVELOPMENT_SEND: "true",
      MASTER_EMAIL: "test@tohuhono.com",
      AUTH_TRUST_HOST: "true",
      AUTH_SECRET,
    },
  },
  use: {
    ...base.use,
    baseURL: "http://localhost:3210",
    serverLog: {
      read: readNextjsLogs,
    },
  },
  projects: [authProject, authenticatedProject, loginProject, smokeProject],
})
