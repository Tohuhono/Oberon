import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { base, defineConfig } from "@dev/playwright"
import { smokeProject } from "@dev/playwright/projects"

const PLAYWRIGHT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".playwright")

const APP_DB_DIR = path.resolve(PLAYWRIGHT_DIR, "db")
const APP_LOG_DIR = path.resolve(PLAYWRIGHT_DIR, "logs")

const APP_LOG_PATH = path.resolve(APP_LOG_DIR, "app.log")
const PREBUILD_LOG_PATH = path.resolve(APP_LOG_DIR, "prebuild.log")

const APP_DB_PATH = path.resolve(APP_DB_DIR, "oberon.db")

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
      `rm -rf '${APP_LOG_DIR}'`,
      `rm -rf '${APP_DB_DIR}'`,
      `mkdir -p '${APP_LOG_DIR}'`,
      `mkdir -p '${APP_DB_DIR}'`,
      `pnpm prebuild > '${PREBUILD_LOG_PATH}' 2>&1`,
      `pnpm dev > '${APP_LOG_PATH}' 2>&1`,
    ].join(" && "),
    url: "http://localhost:3220",
    reuseExistingServer: false,
    stderr: "pipe",
    stdout: "pipe",
    env: {
      PORT: "3220",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
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
    baseURL: "http://localhost:3220",
    serverLog: {
      read: readNextjsLogs,
    },
  },
  projects: [
    { ...smokeProject, testDir: "./test" },
    /*
    { ...authProject, grepInvert: /@docs/ },
    { ...authenticatedProject, grepInvert: /@docs/ },
     */
  ],
})
