import path from "node:path"
import { mkdir, readdir, rm } from "node:fs/promises"
import { execAsync } from "@tohuhono/utils/exec-async"

const MONOREPO_ROOT = path.resolve(import.meta.dirname, "../../../")
const LOCAL_LOG_PATH = path.resolve(import.meta.dirname, "../.playwright/logs")

const CONTAINER_NAME = "oberon-coa-e2e"
const CONTAINER_IMAGE = "oberon-coa-e2e:local"
const CONTAINER_PNPM_STORE_VOLUME = "oberon-coa-pnpm-store"
const CONTAINER_PNPM_STORE_PATH = "/pnpm/store"

const CONTAINER_LOG_PATH = "/logs"

export const NEXTJS_BUILD_LOG_PATH = `${CONTAINER_LOG_PATH}/build.log`
export const NEXTJS_SERVER_LOG_PATH = `${CONTAINER_LOG_PATH}/app.log`
export const VERDACCIO_LOG_PATH = `${CONTAINER_LOG_PATH}/verdaccio.log`

export const COA_ROOT = "/opt/coa"
export const COA_LOG = `${CONTAINER_LOG_PATH}/coa.log`
export const COA_NEXTJS_PORT = 3000

export const COA_NEXTJS_DIR = `${COA_ROOT}/nextjs`
export const VERDACCIO_PORT = 4873
export const VERDACCIO_PING_PATH = `/-/ping`
export const VERDACCIO_AUTH_KEY = `npm_config_//localhost:${VERDACCIO_PORT}/:_authToken`

const PODMAN_BASE_ARGS = ["--storage-opt", "ignore_chown_errors=true"]

async function clearLocalLogs() {
  const entries = await readdir(LOCAL_LOG_PATH)

  await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".log"))
      .map((entry) => rm(path.join(LOCAL_LOG_PATH, entry))),
  )
}

export async function buildContainerImage() {
  const containerBuildContext = path.resolve(import.meta.dirname)

  await execAsync(
    "podman",
    [
      ...PODMAN_BASE_ARGS,
      "build",
      "--tag",
      CONTAINER_IMAGE,
      "--file",
      path.join(containerBuildContext, "verdaccio.Containerfile"),
      containerBuildContext,
    ],
    { cwd: MONOREPO_ROOT },
  )
}

export async function stopContainer() {
  await execAsync("podman", [...PODMAN_BASE_ARGS, "stop", CONTAINER_NAME], {
    cwd: MONOREPO_ROOT,
    stdio: "ignore",
  }).catch(() => {})

  await execAsync("podman", [...PODMAN_BASE_ARGS, "rm", CONTAINER_NAME], {
    cwd: MONOREPO_ROOT,
    stdio: "ignore",
  }).catch(() => {})
}

export async function startContainer() {
  await stopContainer()

  await mkdir(LOCAL_LOG_PATH, { recursive: true })
  await clearLocalLogs()

  await execAsync(
    "podman",
    [
      ...PODMAN_BASE_ARGS,
      "run",
      "--detach",
      "--name",
      CONTAINER_NAME,
      "--publish",
      `${VERDACCIO_PORT}:${VERDACCIO_PORT}`,
      "--publish",
      `${COA_NEXTJS_PORT}:${COA_NEXTJS_PORT}`,
      "--volume",
      `${CONTAINER_PNPM_STORE_VOLUME}:${CONTAINER_PNPM_STORE_PATH}`,
      "--volume",
      `${LOCAL_LOG_PATH}:${CONTAINER_LOG_PATH}`,
      CONTAINER_IMAGE,
    ],
    { cwd: MONOREPO_ROOT },
  )
}

export async function execInContainer(
  command: string,
  options: {
    cwd?: string
    detached?: boolean
  } = {},
) {
  const args = ["exec"]

  if (options.detached) {
    args.push("--detach")
  }

  if (options.cwd) {
    args.push("--workdir", options.cwd)
  }

  args.push(CONTAINER_NAME, "sh", "-lc", command)

  return await execAsync("podman", [...PODMAN_BASE_ARGS, ...args], {
    cwd: MONOREPO_ROOT,
  })
}

export async function readVerdaccioLogs() {
  return execInContainer(`cat ${VERDACCIO_LOG_PATH} 2>/dev/null || true`)
}

export async function readNextjsLogs() {
  return execInContainer(`cat ${NEXTJS_SERVER_LOG_PATH} 2>/dev/null || true`)
}
