import { execSync, spawn } from "child_process"
import { mkdir, rm, writeFile } from "fs/promises"
import path from "path"

// Cross-platform: macOS uses lsof, Linux uses fuser
function killPort(port: number) {
  const cmd =
    process.platform === "darwin"
      ? `lsof -ti tcp:${port} | xargs kill -9 2>/dev/null || true`
      : `fuser -k ${port}/tcp 2>/dev/null || true`
  execSync(cmd, { stdio: "ignore" })
}

const MONOREPO_ROOT = path.resolve(import.meta.dirname, "../../../")
const E2E_RUNTIME_ROOT = path.resolve(
  import.meta.dirname,
  "../.playwright/e2e-runtime",
)
const defaultScaffoldDir = path.join(E2E_RUNTIME_ROOT, "scaffold")
const configuredScaffoldDir = process.env.SCAFFOLD_DIR
const scaffoldDir = configuredScaffoldDir
  ? path.resolve(configuredScaffoldDir)
  : defaultScaffoldDir

const scaffoldRelative = path.relative(E2E_RUNTIME_ROOT, scaffoldDir)
if (scaffoldRelative.startsWith("..") || path.isAbsolute(scaffoldRelative)) {
  throw new Error(`SCAFFOLD_DIR must stay within ${E2E_RUNTIME_ROOT}`)
}

const VERDACCIO_PORT = 4873
const VERDACCIO_REGISTRY = `http://localhost:${VERDACCIO_PORT}`
const VERDACCIO_STORAGE = path.join(E2E_RUNTIME_ROOT, "verdaccio-storage")
const VERDACCIO_CONFIG = path.join(E2E_RUNTIME_ROOT, "verdaccio.yaml")
const VERDACCIO_LOG = path.join(E2E_RUNTIME_ROOT, "verdaccio.log")
const VERDACCIO_AUTH_TOKEN = "local-dev-test"
const VERDACCIO_AUTH_KEY = `npm_config_//localhost:${VERDACCIO_PORT}/:_authToken`

const ENV_KEYS_TO_STRIP = new Set([
  "NPM_CONFIG_REGISTRY",
  "npm_config_registry",
  "NPM_CONFIG_USERCONFIG",
  "npm_config_userconfig",
  "NPM_CONFIG_REPLACE_REGISTRY_HOST",
  "npm_config_replace_registry_host",
])

async function waitForServer(url: string, timeout = 120_000) {
  const start = Date.now()
  let lastLog = 0
  while (Date.now() - start < timeout) {
    try {
      await fetch(url)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 1000))
    }
    const elapsed = Date.now() - start
    if (elapsed - lastLog >= 10_000) {
      console.log(`Waiting for ${url}… ${Math.round(elapsed / 1000)}s`)
      lastLog = elapsed
    }
  }
  throw new Error(`Server did not start within ${timeout}ms`)
}

function execAsync(
  cmd: string,
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("sh", ["-c", cmd], { ...options, stdio: "inherit" })
    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Command failed (exit ${code}): ${cmd}`))
    })
    child.on("error", reject)
  })
}

function getSanitizedEnv() {
  const env = { ...process.env }

  for (const key of ENV_KEYS_TO_STRIP) {
    env[key] = undefined
  }

  if (env.NPM_CONFIG_USERCONFIG || env.npm_config_userconfig) {
    throw new Error("NPM_CONFIG_USERCONFIG is not allowed in e2e setup")
  }

  return env
}

function withVerdaccioAuth(env: NodeJS.ProcessEnv) {
  return {
    ...env,
    [VERDACCIO_AUTH_KEY]: VERDACCIO_AUTH_TOKEN,
  }
}

function getRuntimeEnv(baseEnv: NodeJS.ProcessEnv, sqliteFile: string) {
  const runtimeEnv: NodeJS.ProcessEnv = {
    ...baseEnv,
    SQLITE_FILE: sqliteFile,
    NPM_CONFIG_REGISTRY: VERDACCIO_REGISTRY,
    NPM_CONFIG_REPLACE_REGISTRY_HOST: "never",
    [VERDACCIO_AUTH_KEY]: VERDACCIO_AUTH_TOKEN,
  }

  if (runtimeEnv.NPM_CONFIG_USERCONFIG || runtimeEnv.npm_config_userconfig) {
    throw new Error("NPM_CONFIG_USERCONFIG is not allowed in runtime env")
  }

  return runtimeEnv
}

async function startVerdaccio() {
  killPort(VERDACCIO_PORT)

  await mkdir(E2E_RUNTIME_ROOT, { recursive: true })
  await rm(VERDACCIO_STORAGE, { recursive: true }).catch(() => {})
  await mkdir(VERDACCIO_STORAGE, { recursive: true })

  await writeFile(VERDACCIO_CONFIG, "# verdaccio config stub\n")

  const { runServer } = await import("verdaccio")
  const app = await runServer({
    configPath: VERDACCIO_CONFIG,
    storage: VERDACCIO_STORAGE,
    uplinks: { npmjs: { url: "https://registry.npmjs.org/" } },
    packages: {
      "@oberoncms/*": { access: "$all", publish: "$all" },
      "@tohuhono/*": { access: "$all", publish: "$all" },
      "**": { access: "$all", publish: "$all", proxy: "npmjs" },
    },
    log: {
      type: "file",
      format: "pretty",
      level: "http",
      path: VERDACCIO_LOG,
    },
  })

  await new Promise<void>((resolve) => app.listen(VERDACCIO_PORT, resolve))
  await waitForServer(`${VERDACCIO_REGISTRY}/-/ping`)
  return app
}

function assertExactPublishRegistry() {
  const expectedRegistry = `http://localhost:${VERDACCIO_PORT}`
  if (VERDACCIO_REGISTRY !== expectedRegistry) {
    throw new Error(
      `Publish registry must be exactly ${expectedRegistry}, got ${VERDACCIO_REGISTRY}`,
    )
  }
}

async function publishWorkspacePackages(env: NodeJS.ProcessEnv) {
  assertExactPublishRegistry()

  const publishCommand = `pnpm -r publish --registry ${VERDACCIO_REGISTRY} --no-git-checks`
  await execAsync(publishCommand, { cwd: MONOREPO_ROOT, env })
}

export default async function globalSetup() {
  killPort(3000)

  await mkdir(E2E_RUNTIME_ROOT, { recursive: true })
  await rm(scaffoldDir, { recursive: true }).catch(() => {})

  const baseEnv = getSanitizedEnv()

  console.log("E2E setup: starting Verdaccio")

  const verdaccio = await startVerdaccio()
  let server: ReturnType<typeof spawn> | undefined

  try {
    console.log("E2E setup: publishing workspace packages")
    await publishWorkspacePackages(withVerdaccioAuth(baseEnv))

    const distIndex = path.resolve(import.meta.dirname, "../dist/index.js")

    const sqliteFile = `file:${path.join(scaffoldDir, ".oberon", "oberon.db")}`
    const scaffoldEnv = getRuntimeEnv(baseEnv, sqliteFile)

    console.log("E2E setup: scaffolding app")
    await execAsync(
      `node "${distIndex}" test-app --database turso --send resend --recipe nextjs --use pnpm --email admin@test.com --dir "${scaffoldDir}"`,
      { env: scaffoldEnv },
    )

    console.log("E2E setup: building scaffold app")
    await execAsync("pnpm run build", {
      cwd: scaffoldDir,
      env: { ...scaffoldEnv, USE_DEVELOPMENT_DATABASE: "true" },
    })

    console.log("E2E setup: starting scaffold app")
    server = spawn("pnpm", ["run", "start"], {
      cwd: scaffoldDir,
      stdio: "inherit",
      env: { ...scaffoldEnv, USE_DEVELOPMENT_DATABASE: "true" },
    })

    await waitForServer("http://localhost:3000")
  } catch (err) {
    server?.kill()
    await new Promise<void>((resolve) => verdaccio.close(resolve))
    throw err
  }

  return async () => {
    server?.kill()
    await new Promise<void>((resolve) => verdaccio.close(resolve))
  }
}
