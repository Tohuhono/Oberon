import path from "path"
import { execAsync } from "@tohuhono/utils/exec-async"
import { waitForServer } from "@tohuhono/utils/wait-for-server"
import {
  COA_APP_PORT,
  COA_AUTH_EMAIL,
  COA_CONTAINER_IMAGE,
  COA_CONTAINER_NAME,
  COA_CONTAINER_PNPM_STORE_PATH,
  COA_CONTAINER_PNPM_STORE_VOLUME,
  COA_CONTAINER_ROOT,
  COA_CONTAINER_SCAFFOLD_DIR,
  COA_VERDACCIO_PORT,
  COA_VERDACCIO_REGISTRY,
  MONOREPO_ROOT,
} from "./coa-constants"

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
      COA_CONTAINER_IMAGE,
      "--file",
      path.join(containerBuildContext, "coa-runner.Containerfile"),
      containerBuildContext,
    ),
    { cwd: MONOREPO_ROOT },
  )
}

async function stopContainer() {
  await execAsync("podman", podmanArgs("stop", COA_CONTAINER_NAME), {
    cwd: MONOREPO_ROOT,
    stdio: "ignore",
  }).catch(() => {})

  await execAsync("podman", podmanArgs("rm", COA_CONTAINER_NAME), {
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
      COA_CONTAINER_NAME,
      "--publish",
      `${COA_VERDACCIO_PORT}:${COA_VERDACCIO_PORT}`,
      "--publish",
      `${COA_APP_PORT}:${COA_APP_PORT}`,
      "--volume",
      `${COA_CONTAINER_PNPM_STORE_VOLUME}:${COA_CONTAINER_PNPM_STORE_PATH}`,
      COA_CONTAINER_IMAGE,
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

  args.push(COA_CONTAINER_NAME, "sh", "-lc", command)

  await execAsync("podman", podmanArgs(...args), {
    cwd: MONOREPO_ROOT,
  })
}

async function publishWorkspacePackages() {
  const authKey = `npm_config_//localhost:${COA_VERDACCIO_PORT}/:_authToken`

  await execAsync(
    "pnpm",
    [
      "-r",
      "publish",
      "--registry",
      COA_VERDACCIO_REGISTRY,
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
      `--email ${COA_AUTH_EMAIL}`,
      `--dir ${COA_CONTAINER_SCAFFOLD_DIR}`,
      `> ${COA_CONTAINER_ROOT}/scaffold.log 2>&1`,
    ].join(" "),
    { cwd: COA_CONTAINER_ROOT },
  )

  console.log("COA setup: building scaffold app in container")
  await execInContainer(
    `pnpm run build > ${COA_CONTAINER_ROOT}/build.log 2>&1`,
    {
      cwd: COA_CONTAINER_SCAFFOLD_DIR,
    },
  )

  console.log("COA setup: starting scaffold app in container")
  await execInContainer(`pnpm run start > ${COA_CONTAINER_ROOT}/app.log 2>&1`, {
    cwd: COA_CONTAINER_SCAFFOLD_DIR,
    detached: true,
  })
}

export default async function globalSetup() {
  console.log("COA setup: building runner image")
  await buildContainerImage()

  console.log("COA setup: starting container with Verdaccio")

  await startContainer()

  try {
    await waitForServer(`${COA_VERDACCIO_REGISTRY}/-/ping`)

    console.log("COA setup: publishing workspace packages")
    await publishWorkspacePackages()

    await scaffoldInContainer()

    await waitForServer(`http://localhost:${COA_APP_PORT}`)
  } catch (err) {
    await stopContainer()
    throw err
  }

  return async () => {
    await stopContainer()
  }
}
