import { createServer } from "node:net"
import { base, defineConfig } from "@dev/playwright"
import {
  authProject,
  authenticatedProject,
  loginProject,
} from "@dev/playwright/projects"
import { COA_NEXTJS_PORT, readNextjsLogs } from "./test/container"

async function getAvailablePort() {
  return await new Promise<number>((resolve, reject) => {
    const server = createServer()

    server.on("error", reject)

    server.listen(0, "127.0.0.1", () => {
      const address = server.address()

      if (!address || typeof address === "string") {
        reject(new Error("Failed to allocate a COA test port"))

        return
      }

      server.close((error) => {
        if (error) {
          reject(error)

          return
        }

        resolve(address.port)
      })
    })
  })
}

process.env.COA_NEXTJS_PORT ??= String(await getAvailablePort())

export default defineConfig({
  ...base,
  testDir: "../..",
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
