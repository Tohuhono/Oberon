import path from "node:path"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { base, defineConfig } from "@dev/playwright"
import {
  authProject,
  authenticatedProject,
  loginProject,
  tddProject,
  smokeProject,
} from "@dev/playwright/projects"

const PLAYWRIGHT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".playwright",
)

const APP_LOG_PATH = path.resolve(PLAYWRIGHT_DIR, "logs/app.log")
const APP_DB_PATH = path.resolve(PLAYWRIGHT_DIR, "db/oberon.db")
const BASE_DB = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".oberon/db/oberon.db",
)
const AUTH_SECRET = "playwright-test-auth-secret"

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
      `rm -f '${APP_LOG_PATH}'`,
      `mkdir -p '${path.dirname(APP_LOG_PATH)}'`,
      `mkdir -p '${path.dirname(APP_DB_PATH)}'`,
      `cp -r '${BASE_DB}'* '${path.dirname(APP_DB_PATH)}'`,
      `pnpm start > '${APP_LOG_PATH}' 2>&1`,
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
      SQLITE_FILE: `file:${APP_DB_PATH}`,
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
  projects: [
    authProject,
    authenticatedProject,
    tddProject,
    loginProject,
    smokeProject,
  ],
})
