import { base, defineConfig } from "@dev/playwright"
import {
  authProject,
  authenticatedProject,
  loginProject,
} from "@dev/playwright/projects"
import { COA_NEXTJS_PORT, readNextjsLogs } from "./test/container"

export default defineConfig({
  ...base,
  use: {
    ...base.use,
    baseURL: `http://localhost:${COA_NEXTJS_PORT}`,
    serverLog: {
      read: readNextjsLogs,
    },
  },
  projects: [
    {
      ...authProject,
      dependencies: ["container-initialise", ...authProject.dependencies],
    },
    {
      ...authenticatedProject,
      grepInvert: /@playground/,
    },
    {
      name: "container-initialise",
      testDir: "./test",
      grep: /@container-initialise/,
      teardown: "container-teardown",
    },
    {
      name: "container-verdaccio",
      testDir: "./test",
      grep: /@verdaccio/,
      dependencies: ["container-initialise"],
    },
    {
      ...loginProject,
      dependencies: ["container-initialise", ...loginProject.dependencies],
    },
    {
      name: "container-teardown",
      grep: /@container-teardown/,
    },
  ],
})
