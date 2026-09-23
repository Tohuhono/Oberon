import path from "node:path"

import { base, defineConfig } from "@dev/playwright"
import { authProject, authenticatedProject, smokeProject } from "@dev/playwright/projects"

import {
  NEXTJS_BASE_URL,
  readNextjsServerLogs,
  readTanstackServerLogs,
  TANSTACK_BASE_URL,
} from "./test/container"

const PLAYWRIGHT_CONTAINER_STATE_PATH = path.resolve(
  process.cwd(),
  ".playwright/container-state.json",
)

export default defineConfig({
  ...base,
  use: {
    ...base.use,
    containerStatePath: PLAYWRIGHT_CONTAINER_STATE_PATH,
    serverLog: {
      read: () => readNextjsServerLogs(),
    },
  },
  projects: [
    {
      name: "initialise-pod",
      testDir: "./test",
      grep: /@initialise-pod/,
      teardown: "teardown-pod",
    },
    {
      name: "initialise-nextjs",
      testDir: "./test",
      grep: /@initialise-nextjs/,
      dependencies: ["initialise-pod"],
    },
    {
      name: "verdaccio-nextjs",
      testDir: "./test",
      grep: /@verdaccio-nextjs/,
      dependencies: ["initialise-nextjs"],
    },
    {
      name: "initialise-tanstack",
      testDir: "./test",
      grep: /@initialise-tanstack/,
      dependencies: ["initialise-pod"],
    },
    {
      ...authProject,
      name: "auth-nextjs",
      dependencies: ["initialise-nextjs"],
      use: {
        baseURL: NEXTJS_BASE_URL,
      },
    },
    {
      ...authenticatedProject,
      name: "nextjs",
      dependencies: ["auth-nextjs"],
      use: {
        baseURL: NEXTJS_BASE_URL,
      },
    },
    {
      ...smokeProject,
      name: "smoke-tanstack",
      dependencies: ["initialise-tanstack"],
      use: {
        baseURL: TANSTACK_BASE_URL,
        serverLog: {
          read: () => readTanstackServerLogs(),
        },
      },
    },
    {
      name: "teardown-pod",
      grep: /@teardown-pod/,
    },
  ],
})
