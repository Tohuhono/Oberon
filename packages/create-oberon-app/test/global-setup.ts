import { execSync, spawn } from "child_process"
import { mkdir, readFile, readdir, rm, writeFile } from "fs/promises"
import path from "path"
import os from "os"

// Cross-platform: macOS uses lsof, Linux uses fuser
function killPort(port: number) {
  const cmd =
    process.platform === "darwin"
      ? `lsof -ti tcp:${port} | xargs kill -9 2>/dev/null || true`
      : `fuser -k ${port}/tcp 2>/dev/null || true`
  execSync(cmd, { stdio: "ignore" })
}

const scaffoldDir =
  process.env.SCAFFOLD_DIR ?? path.join(os.tmpdir(), "oberon-scaffold-test")

const VERDACCIO_PORT = 4873
const VERDACCIO_REGISTRY = `http://localhost:${VERDACCIO_PORT}`
const VERDACCIO_STORAGE = path.join(os.tmpdir(), "oberon-verdaccio-storage")
const LOCAL_PACKS_DIR = path.join(os.tmpdir(), "oberon-local-packs")
const PNPM_STORE = path.join(os.tmpdir(), "oberon-test-pnpm-store")
const MONOREPO_ROOT = path.resolve(import.meta.dirname, "../../../")

// All publishable workspace packages in dependency order
// (leaf packages first so transitive deps resolve correctly)
const WORKSPACE_PACKAGES = [
  "packages/tohuhono/utils",
  "packages/tohuhono/ui",
  "packages/tohuhono/puck-blocks",
  "packages/oberoncms/sqlite",
  "packages/oberoncms/core",
  "packages/plugins/development",
  "packages/plugins/turso",
  "packages/plugins/pgsql",
  "packages/plugins/uploadthing",
  "packages/plugins/flydrive",
]

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

// Non-blocking async exec — keeps the event loop free so in-process servers
// (Verdaccio) can respond to requests while child processes are running.
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

async function startVerdaccio() {
  killPort(VERDACCIO_PORT)

  for (const scope of ["@oberoncms", "@tohuhono"]) {
    await rm(path.join(VERDACCIO_STORAGE, scope), { recursive: true }).catch(
      () => {},
    )
  }
  await mkdir(VERDACCIO_STORAGE, { recursive: true })

  const verdaccioConfig = path.join(os.tmpdir(), "oberon-verdaccio.yaml")
  await writeFile(verdaccioConfig, "# verdaccio config stub\n")

  const { runServer } = await import("verdaccio")
  const app = await runServer({
    configPath: verdaccioConfig,
    storage: VERDACCIO_STORAGE,
    uplinks: { npmjs: { url: "https://registry.npmjs.org/" } },
    packages: {
      "@oberoncms/*": { access: "$all", publish: "$all" },
      "@tohuhono/*": { access: "$all", publish: "$all" },
      "**": { access: "$all", proxy: "npmjs" },
    },
    log: {
      type: "file",
      format: "pretty",
      level: "http",
      path: path.join(os.tmpdir(), "oberon-verdaccio.log"),
    },
  })

  await new Promise<void>((resolve) => app.listen(VERDACCIO_PORT, resolve))
  // Verify Verdaccio is actually accepting connections before returning
  await waitForServer(`${VERDACCIO_REGISTRY}/-/ping`)
  return app
}

async function publishLocalPackages(npmrcPath: string) {
  await rm(LOCAL_PACKS_DIR, { recursive: true }).catch(() => {})
  await mkdir(LOCAL_PACKS_DIR, { recursive: true })

  for (const pkgPath of WORKSPACE_PACKAGES) {
    const pkgDir = path.join(MONOREPO_ROOT, pkgPath)
    const pkg: unknown = JSON.parse(
      await readFile(path.join(pkgDir, "package.json"), "utf-8"),
    )
    if (
      typeof pkg !== "object" ||
      pkg === null ||
      !("name" in pkg) ||
      !("version" in pkg) ||
      typeof pkg.name !== "string" ||
      typeof pkg.version !== "string"
    ) {
      throw new Error(`Invalid package.json in ${pkgPath}`)
    }
    // Diff the directory before/after to find the new tarball — avoids
    // parsing pnpm pack's verbose stdout or reconstructing the filename.
    const before = new Set(await readdir(LOCAL_PACKS_DIR))
    execSync(`pnpm pack --pack-destination "${LOCAL_PACKS_DIR}"`, {
      cwd: pkgDir,
      stdio: "inherit",
    })
    const newFile = (await readdir(LOCAL_PACKS_DIR)).find(
      (f) => !before.has(f) && f.endsWith(".tgz"),
    )
    if (!newFile) throw new Error(`pnpm pack produced no tarball in ${pkgPath}`)
    const tarball = path.join(LOCAL_PACKS_DIR, newFile)

    // npm publish communicates with in-process Verdaccio — must be async
    // so the event loop stays free to handle the incoming HTTP request
    await execAsync(
      `npm publish "${tarball}" --registry ${VERDACCIO_REGISTRY} --userconfig "${npmrcPath}" --no-provenance`,
    )
  }
}

export default async function globalSetup() {
  // Kill any stale servers from previous runs
  killPort(3000)

  await rm(scaffoldDir, { recursive: true }).catch(() => {})

  const verdaccio = await startVerdaccio()
  let server: ReturnType<typeof spawn> | undefined

  try {
    // Write npmrc with Verdaccio registry and auth token (required even for $all).
    // Also written to fakeHome/.npmrc so npm always picks it up via $HOME lookup.
    const npmrcContent = `registry=${VERDACCIO_REGISTRY}\nreplace-registry-host=never\n//localhost:${VERDACCIO_PORT}/:_authToken=local-dev-test\n`
    const npmrcPath = path.join(os.tmpdir(), "oberon-verdaccio.npmrc")
    await writeFile(npmrcPath, npmrcContent)

    // Give pnpm a fake HOME so $HOME/.npmrc is our controlled registry config.
    // Project-level and home-dir npmrc are read before env-var config, making
    // this more reliable than NPM_CONFIG_* vars on some pnpm/OS combinations.
    const fakeHome = path.join(os.tmpdir(), "oberon-test-home")
    await rm(fakeHome, { recursive: true }).catch(() => {})
    await mkdir(fakeHome, { recursive: true })
    await writeFile(path.join(fakeHome, ".npmrc"), npmrcContent)

    await publishLocalPackages(npmrcPath)

    const distIndex = path.resolve(import.meta.dirname, "../dist/index.js")

    const sqliteFile = `file:${path.join(scaffoldDir, ".oberon", "oberon.db")}`
    const { SQLITE_FILE: _stripped, ...envWithoutSqlite } = process.env
    const scaffoldEnv = {
      ...envWithoutSqlite,
      HOME: fakeHome,
      SQLITE_FILE: sqliteFile,
      NPM_CONFIG_REGISTRY: VERDACCIO_REGISTRY,
      npm_config_registry: VERDACCIO_REGISTRY,
      // Prevent pnpm from replacing our local registry URL with registry.npmjs.org
      NPM_CONFIG_REPLACE_REGISTRY_HOST: "never",
      npm_config_replace_registry_host: "never",
      NPM_CONFIG_USERCONFIG: npmrcPath,
      PNPM_STORE_DIR: PNPM_STORE,
    }

    // scaffold, build and start all use pnpm install / pnpm run — must be async
    // so Verdaccio can handle the registry requests for pnpm install
    await execAsync(
      `node "${distIndex}" test-app --database turso --send resend --recipe nextjs --use pnpm --email admin@test.com --dir "${scaffoldDir}"`,
      { env: scaffoldEnv },
    )

    await execAsync("pnpm run build", {
      cwd: scaffoldDir,
      env: { ...scaffoldEnv, USE_DEVELOPMENT_DATABASE: "true" },
    })

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
