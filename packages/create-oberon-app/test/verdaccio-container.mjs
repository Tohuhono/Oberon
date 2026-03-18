import { mkdir, rm } from "fs/promises"
import path from "path"
import { runServer } from "verdaccio"

const verdaccioRoot = "/opt/verdaccio"
const verdaccioPort = 4873
const storagePath = path.join(verdaccioRoot, "storage")
const configPath = path.join(verdaccioRoot, "verdaccio.yaml")
const logPath = path.join(verdaccioRoot, "verdaccio.log")

await rm(storagePath, { recursive: true, force: true })
await mkdir(storagePath, { recursive: true })

const app = await runServer({
  configPath,
  storage: storagePath,
  uplinks: { npmjs: { url: "https://registry.npmjs.org/" } },
  packages: {
    "@oberoncms/*": { access: "$all", publish: "$all" },
    "@tohuhono/*": { access: "$all", publish: "$all" },
    "create-oberon-app": { access: "$all", publish: "$all" },
    "**": { access: "$all", publish: "$all", proxy: "npmjs" },
  },
  log: {
    type: "file",
    format: "pretty",
    level: "http",
    path: logPath,
  },
})

await new Promise((resolve) => app.listen(verdaccioPort, resolve))
console.log(`verdaccio-ready:${verdaccioPort}`)

function closeServer() {
  app.close(() => {
    process.exit(0)
  })
}

process.on("SIGTERM", closeServer)
process.on("SIGINT", closeServer)

await new Promise(() => {})
