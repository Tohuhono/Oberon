import { base, defineConfig } from "@dev/playwright"
import {
  authProject,
  authenticatedProject,
  loginProject,
} from "@dev/playwright/projects"
import { readNextjsLogs } from "./test/container"

export default defineConfig({
  ...base,
  testDir: "../..",
  use: {
    ...base.use,
    baseURL: "http://localhost:3000",
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
      dependencies: [
        "container-initialise",
        ...authenticatedProject.dependencies,
      ],
    },
    {
      name: "container-initialise",
      grep: /@container-initialise/,
      teardown: "container-teardown",
    },
    {
      name: "container-verdaccio",
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
