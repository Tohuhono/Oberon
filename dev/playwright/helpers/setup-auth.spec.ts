import { test } from "../base.config"
import { completeUiLoginWithOtp } from "./bootstrap"

test.describe("Shared auth setup", { tag: "@auth" }, () => {
  test("logs in and writes reusable browser state", async ({
    page,
    serverLog,
    authEmail,
    authStorageStatePath,
  }, testInfo) => {
    if (!authEmail) {
      throw new Error("authEmail fixture option must be provided")
    }

    if (!authStorageStatePath) {
      throw new Error("authStorageStatePath fixture option must be provided")
    }

    try {
      await completeUiLoginWithOtp({
        page,
        email: authEmail,
        getLog: serverLog.read,
        storageStatePath: authStorageStatePath,
      })
    } catch (error) {
      const logs = await serverLog.read()

      await testInfo.attach("nextjs-server-log-tail", {
        body: logs.slice(-20_000),
        contentType: "text/plain",
      })

      throw error
    }
  })
})
