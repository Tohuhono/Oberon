import path from "path"

import { test } from "@dev/playwright"
import { expect } from "@playwright/test"
import { execAsync } from "@tohuhono/utils/exec-async"
import { waitForServer } from "@tohuhono/utils/wait-for-server"

import {
  buildContainerImages,
  COA_APP_DIR,
  execInContainer,
  NEXTJS_APP_PORT,
  NEXTJS_BUILD_LOG_PATH,
  NEXTJS_COA_LOG_PATH,
  NEXTJS_CONTAINER_NAME,
  NEXTJS_SERVER_LOG_PATH,
  startPod,
  stopPod,
  TANSTACK_APP_PORT,
  TANSTACK_BUILD_LOG_PATH,
  TANSTACK_COA_LOG_PATH,
  TANSTACK_CONTAINER_NAME,
  TANSTACK_SERVER_LOG_PATH,
  VERDACCIO_AUTH_KEY,
  VERDACCIO_PING_PATH,
  VERDACCIO_PORT,
} from "./container"

const MONOREPO_ROOT = path.resolve(import.meta.dirname, "../../../")

test.describe.serial("Initialise Pod", { tag: "@initialise-pod" }, () => {
  test("Build Container Images", async () => {
    await expect(buildContainerImages()).resolves.not.toThrow()
  })

  test("Start Pod", async () => {
    await expect(startPod()).resolves.not.toThrow()

    await expect(
      waitForServer(`http://localhost:${VERDACCIO_PORT}${VERDACCIO_PING_PATH}`),
    ).resolves.toBeTruthy()
  })

  test("Publish packages", async () => {
    await expect(
      execAsync(
        "pnpm",
        [
          "-r",
          "publish",
          "--registry",
          `http://localhost:${VERDACCIO_PORT}`,
          "--no-git-checks",
          "--provenance",
          "false",
        ],
        {
          cwd: MONOREPO_ROOT,
          env: {
            ...process.env,
            [VERDACCIO_AUTH_KEY]: "local-dev-test",
            NPM_CONFIG_LOGLEVEL: "warn",
            npm_config_loglevel: "warn",
          },
        },
      ),
    ).resolves.not.toThrow()
  })
})

test.describe.serial("Initialise Tanstack", { tag: "@initialise-tanstack" }, () => {
  test("Create Oberon App", async ({ authEmail }) => {
    test.setTimeout(180000)

    expect(authEmail).toBeDefined()

    await expect(
      execInContainer(
        [
          "pnpm dlx create-oberon-app test-app",
          "--database turso",
          "--send resend",
          "--recipe tanstack",
          "--use pnpm",
          `--email ${authEmail}`,
          `--dir ${COA_APP_DIR}`,
          `> ${TANSTACK_COA_LOG_PATH} 2>&1`,
        ].join(" "),
        { container: TANSTACK_CONTAINER_NAME, cwd: "/" },
      ),
    ).resolves.not.toThrow()
  })

  test("Build Oberon App", async () => {
    await expect(
      execInContainer(`pnpm run build > ${TANSTACK_BUILD_LOG_PATH} 2>&1`, {
        container: TANSTACK_CONTAINER_NAME,
      }),
    ).resolves.not.toThrow()
  })

  test("Start Oberon App", async () => {
    await expect(
      execInContainer(
        `pnpm run start --host 0.0.0.0 --port ${TANSTACK_APP_PORT} > ${TANSTACK_SERVER_LOG_PATH} 2>&1`,
        {
          container: TANSTACK_CONTAINER_NAME,
          detached: true,
        },
      ),
    ).resolves.not.toThrow()

    await expect(waitForServer(`http://127.0.0.1:${TANSTACK_APP_PORT}`)).resolves.toBeTruthy()
  })
})

test.describe.serial("Initialise Nextjs", { tag: "@initialise-nextjs" }, () => {
  test("Create Oberon App", async ({ authEmail }) => {
    test.setTimeout(180000)

    expect(authEmail).toBeDefined()

    await expect(
      execInContainer(
        [
          "pnpm dlx create-oberon-app test-app",
          "--database turso",
          "--send resend",
          "--recipe nextjs",
          "--use pnpm",
          `--email ${authEmail}`,
          `--dir ${COA_APP_DIR}`,
          `> ${NEXTJS_COA_LOG_PATH} 2>&1`,
        ].join(" "),
        { container: NEXTJS_CONTAINER_NAME, cwd: "/" },
      ),
    ).resolves.not.toThrow()
  })

  test("Build Oberon App", async () => {
    await expect(
      execInContainer(`pnpm run build > ${NEXTJS_BUILD_LOG_PATH} 2>&1`, {
        container: NEXTJS_CONTAINER_NAME,
      }),
    ).resolves.not.toThrow()
  })

  test("Start Oberon App", async () => {
    await expect(
      execInContainer(`pnpm run start -p ${NEXTJS_APP_PORT} > ${NEXTJS_SERVER_LOG_PATH} 2>&1`, {
        container: NEXTJS_CONTAINER_NAME,
        detached: true,
      }),
    ).resolves.not.toThrow()

    await expect(waitForServer(`http://localhost:${NEXTJS_APP_PORT}`)).resolves.toBeTruthy()
  })
})

test.describe("Pod teardown", { tag: "@teardown-pod" }, () => {
  test("Stops pod", async () => {
    await stopPod()
  })
})
