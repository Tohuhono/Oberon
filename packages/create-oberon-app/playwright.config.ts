import { base, defineConfig } from "@dev/playwright"
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
      name: "auth",
      grep: /@auth/,
      dependencies: ["container-initialise"],
    },
    {
      name: "authenticated",
      grep: /@cms/,
      use: {
        storageState: base.use?.authStorageStatePath,
      },
      dependencies: ["container-initialise", "auth"],
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
      name: "login",
      grep: /@login/,
      dependencies: ["container-initialise"],
    },
    {
      name: "container-teardown",
      grep: /@container-teardown/,
    },
  ],
})
