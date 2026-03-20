import path from "path"
import { test } from "@dev/playwright"
import { expect } from "@playwright/test"
import { execAsync } from "@tohuhono/utils/exec-async"
import { waitForServer } from "@tohuhono/utils/wait-for-server"
import {
  buildContainerImage,
  COA_LOG,
  NEXTJS_BUILD_LOG_PATH,
  COA_NEXTJS_DIR,
  COA_NEXTJS_PORT,
  NEXTJS_SERVER_LOG_PATH,
  COA_ROOT,
  execInContainer,
  startContainer,
  stopContainer,
  VERDACCIO_AUTH_KEY,
  VERDACCIO_PING_PATH,
  VERDACCIO_PORT,
} from "./container"

const MONOREPO_ROOT = path.resolve(import.meta.dirname, "../../../")

test.describe.serial(
  "Container initialise",
  { tag: "@container-initialise" },
  () => {
    test("Build Container", async () => {
      await expect(buildContainerImage()).resolves.not.toThrow()
    })

    test("Start Container", async () => {
      await expect(startContainer()).resolves.not.toThrow()

      await expect(
        waitForServer(
          `http://localhost:${VERDACCIO_PORT}${VERDACCIO_PING_PATH}`,
        ),
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

    test("Create Oberon App", async ({ authEmail }) => {
      test.setTimeout(60000)

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
            `--dir ${COA_NEXTJS_DIR}`,
            `> ${COA_LOG} 2>&1`,
          ].join(" "),
          { cwd: COA_ROOT },
        ),
      ).resolves.not.toThrow()
    })

    test("Build Oberon App", async () => {
      await expect(
        execInContainer(`pnpm run build > ${NEXTJS_BUILD_LOG_PATH} 2>&1`, {
          cwd: COA_NEXTJS_DIR,
        }),
      ).resolves.not.toThrow()
    })

    test("Start Oberon App", async () => {
      await expect(
        execInContainer(`pnpm run start > ${NEXTJS_SERVER_LOG_PATH} 2>&1`, {
          cwd: COA_NEXTJS_DIR,
          detached: true,
        }),
      ).resolves.not.toThrow()

      await expect(
        waitForServer(`http://localhost:${COA_NEXTJS_PORT}`),
      ).resolves.toBeTruthy()
    })
  },
)

test.describe("Container teardown", { tag: "@container-teardown" }, () => {
  test("stops container", async () => {
    await stopContainer()
  })
})
