import { mkdir, readdir, rm } from "node:fs/promises"
import path from "node:path"

import { execAsync } from "@tohuhono/utils/exec-async"

const MONOREPO_ROOT = path.resolve(import.meta.dirname, "../../../")
export const LOCAL_LOG_PATH = path.resolve(import.meta.dirname, "../.playwright/logs")
const POD_NAME = `oberon-coa-pod`

const APP_CONTAINER_IMAGE = "oberon-coa-app:local"
const COA_ROOT = "/opt/coa"
export const COA_APP_DIR = `${COA_ROOT}/app`

const CONTAINER_LOG_PATH = "/logs"
const CONTAINER_PNPM_STORE_VOLUME = "oberon-coa-pnpm-store"
const CONTAINER_PNPM_STORE_PATH = "/pnpm/store"

export type ContainerName = typeof VERDACCIO_CONTAINER_NAME | typeof NEXTJS_CONTAINER_NAME

const VERDACCIO_CONTAINER_IMAGE = "oberon-coa-verdaccio:local"
export const VERDACCIO_CONTAINER_NAME = "oberon-coa-verdaccio"

export const VERDACCIO_PORT = 4873
export const VERDACCIO_PING_PATH = `/-/ping`
export const VERDACCIO_AUTH_KEY = `npm_config_//localhost:${VERDACCIO_PORT}/:_authToken`

export const NEXTJS_CONTAINER_NAME = "oberon-coa-nextjs"
export const NEXTJS_APP_PORT = 3030
export const NEXTJS_BUILD_LOG_PATH = `${CONTAINER_LOG_PATH}/nextjs-build.log`
export const NEXTJS_SERVER_LOG_PATH = `${CONTAINER_LOG_PATH}/nextjs-server.log`
export const NEXTJS_COA_LOG_PATH = `${CONTAINER_LOG_PATH}/nextjs-coa.log`

const PODMAN_BASE_ARGS = ["--storage-opt", "ignore_chown_errors=true"]

async function clearLocalLogs(localLogPath: string) {
  try {
    const entries = await readdir(localLogPath)
    await Promise.all(
      entries
        .filter((entry) => entry.endsWith(".log"))
        .map((entry) => rm(path.join(localLogPath, entry))),
    )
  } catch {
    // Directory might not exist yet, ignore error
  }
}

export async function buildContainerImages() {
  const containerBuildContext = path.resolve(import.meta.dirname)

  await execAsync(
    "podman",
    [
      ...PODMAN_BASE_ARGS,
      "build",
      "--tag",
      VERDACCIO_CONTAINER_IMAGE,
      "--file",
      path.join(containerBuildContext, "verdaccio.Containerfile"),
      containerBuildContext,
    ],
    { cwd: MONOREPO_ROOT },
  )

  await execAsync(
    "podman",
    [
      ...PODMAN_BASE_ARGS,
      "build",
      "--tag",
      APP_CONTAINER_IMAGE,
      "--file",
      path.join(containerBuildContext, "app.Containerfile"),
      containerBuildContext,
    ],
    { cwd: MONOREPO_ROOT },
  )
}

export async function stopPod() {
  await execAsync("podman", [...PODMAN_BASE_ARGS, "pod", "stop", POD_NAME], {
    cwd: MONOREPO_ROOT,
    stdio: "ignore",
  }).catch(() => {})

  await execAsync("podman", [...PODMAN_BASE_ARGS, "pod", "rm", POD_NAME], {
    cwd: MONOREPO_ROOT,
    stdio: "ignore",
  }).catch(() => {})
}

export async function startPod() {
  await stopPod()

  await mkdir(LOCAL_LOG_PATH, { recursive: true })
  await clearLocalLogs(LOCAL_LOG_PATH)

  await execAsync(
    "podman",
    [
      ...PODMAN_BASE_ARGS,
      "pod",
      "create",
      "--name",
      POD_NAME,
      "--publish",
      `${VERDACCIO_PORT}:${VERDACCIO_PORT}`,
      "--publish",
      `${NEXTJS_APP_PORT}:${NEXTJS_APP_PORT}`,
    ],
    { cwd: MONOREPO_ROOT },
  )

  await execAsync(
    "podman",
    [
      ...PODMAN_BASE_ARGS,
      "run",
      "--detach",
      "--pod",
      POD_NAME,
      "--volume",
      `${LOCAL_LOG_PATH}:${CONTAINER_LOG_PATH}`, // Isolated logs
      "--name",
      VERDACCIO_CONTAINER_NAME,
      VERDACCIO_CONTAINER_IMAGE,
    ],
    { cwd: MONOREPO_ROOT },
  )

  await execAsync(
    "podman",
    [
      ...PODMAN_BASE_ARGS,
      "run",
      "--detach",
      "--pod",
      POD_NAME,
      "--name",
      NEXTJS_CONTAINER_NAME,
      "--volume",
      `${CONTAINER_PNPM_STORE_VOLUME}:${CONTAINER_PNPM_STORE_PATH}`, // Safe to share cache volume
      "--volume",
      `${LOCAL_LOG_PATH}:${CONTAINER_LOG_PATH}`, // Isolated logs
      APP_CONTAINER_IMAGE,
    ],
    { cwd: MONOREPO_ROOT },
  )
}

export async function execInContainer(
  command: string,
  {
    container,
    cwd = COA_APP_DIR,
    detached,
  }: {
    container: ContainerName
    cwd?: string
    detached?: boolean
  },
) {
  const args = ["exec"]

  if (detached) {
    args.push("--detach")
  }

  if (cwd) {
    args.push("--workdir", cwd)
  }

  args.push(container, "sh", "-lc", command)

  return await execAsync("podman", [...PODMAN_BASE_ARGS, ...args], {
    cwd: MONOREPO_ROOT,
  })
}

export async function readNextjsServerLogs() {
  return execAsync("cat", ["nextjs-server.log"], {
    cwd: LOCAL_LOG_PATH,
  })
}
