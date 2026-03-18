import path from "path"
import { execAsync } from "@tohuhono/utils/exec-async"
import { waitForServer } from "@tohuhono/utils/wait-for-server"

const MONOREPO_ROOT = path.resolve(import.meta.dirname, "../../../")
const CONTAINER_NAME = "oberon-coa-e2e"
const CONTAINER_IMAGE = "oberon-coa-e2e:local"
const CONTAINER_PNPM_STORE_VOLUME = "oberon-coa-pnpm-store"
const CONTAINER_PNPM_STORE_PATH = "/pnpm/store"
const CONTAINER_ROOT = "/opt/coa"
const CONTAINER_SCAFFOLD_DIR = "/opt/coa/scaffold"

const VERDACCIO_PORT = 4873
const APP_PORT = 3000
const VERDACCIO_REGISTRY = `http://localhost:${VERDACCIO_PORT}`

function podmanArgs(...args: string[]) {
  return ["--storage-opt", "ignore_chown_errors=true", ...args]
}
async function buildContainerImage() {
  const containerBuildContext = path.resolve(import.meta.dirname)

  await execAsync(
    "podman",
    podmanArgs(
      "build",
      "--tag",
      CONTAINER_IMAGE,
      "--file",
      path.join(containerBuildContext, "coa-runner.Containerfile"),
      containerBuildContext,
    ),
    { cwd: MONOREPO_ROOT },
  )
}

async function stopContainer() {
  await execAsync("podman", podmanArgs("stop", CONTAINER_NAME), {
    cwd: MONOREPO_ROOT,
    stdio: "ignore",
  }).catch(() => {})

  await execAsync("podman", podmanArgs("rm", CONTAINER_NAME), {
    cwd: MONOREPO_ROOT,
    stdio: "ignore",
  }).catch(() => {})
}

async function startContainer() {
  await stopContainer()

  await execAsync(
    "podman",
    podmanArgs(
      "run",
      "--detach",
      "--name",
      CONTAINER_NAME,
      "--publish",
      `${VERDACCIO_PORT}:${VERDACCIO_PORT}`,
      "--publish",
      `${APP_PORT}:${APP_PORT}`,
      "--volume",
      `${CONTAINER_PNPM_STORE_VOLUME}:${CONTAINER_PNPM_STORE_PATH}`,
      CONTAINER_IMAGE,
    ),
    { cwd: MONOREPO_ROOT },
  )
}

async function execInContainer(
  command: string,
  options: {
    cwd?: string
    detached?: boolean
  },
) {
  const args = ["exec"]

  if (options.detached) {
    args.push("--detach")
  }

  if (options.cwd) {
    args.push("--workdir", options.cwd)
  }

  args.push(CONTAINER_NAME, "sh", "-lc", command)

  await execAsync("podman", podmanArgs(...args), {
    cwd: MONOREPO_ROOT,
  })
}

async function publishWorkspacePackages() {
  const authKey = `npm_config_//localhost:${VERDACCIO_PORT}/:_authToken`

  await execAsync(
    "pnpm",
    [
      "-r",
      "publish",
      "--registry",
      VERDACCIO_REGISTRY,
      "--no-git-checks",
      "--provenance",
      "false",
    ],
    {
      cwd: MONOREPO_ROOT,
      env: {
        ...process.env,
        [authKey]: "local-dev-test",
        NPM_CONFIG_LOGLEVEL: "warn",
        npm_config_loglevel: "warn",
      },
    },
  )
}

async function scaffoldInContainer() {
  console.log("COA setup: scaffolding app in container")
  await execInContainer(
    [
      "pnpm dlx create-oberon-app test-app",
      "--database turso",
      "--send resend",
      "--recipe nextjs",
      "--use pnpm",
      "--email admin@test.com",
      `--dir ${CONTAINER_SCAFFOLD_DIR}`,
      `>> ${CONTAINER_ROOT}/scaffold.log 2>&1`,
    ].join(" "),
    { cwd: CONTAINER_ROOT },
  )

  console.log("COA setup: building scaffold app in container")
  await execInContainer(`pnpm run build >> ${CONTAINER_ROOT}/build.log 2>&1`, {
    cwd: CONTAINER_SCAFFOLD_DIR,
  })

  console.log("COA setup: starting scaffold app in container")
  await execInContainer(`pnpm run start >> ${CONTAINER_ROOT}/app.log 2>&1`, {
    cwd: CONTAINER_SCAFFOLD_DIR,
    detached: true,
  })
}

export default async function globalSetup() {
  console.log("COA setup: building runner image")
  await buildContainerImage()

  console.log("COA setup: starting container with Verdaccio")

  await startContainer()

  try {
    await waitForServer(`${VERDACCIO_REGISTRY}/-/ping`)

    console.log("COA setup: publishing workspace packages")
    await publishWorkspacePackages()

    await scaffoldInContainer()

    await waitForServer(`http://localhost:${APP_PORT}`)
  } catch (err) {
    await stopContainer()
    throw err
  }

  return async () => {
    await stopContainer()
  }
}
