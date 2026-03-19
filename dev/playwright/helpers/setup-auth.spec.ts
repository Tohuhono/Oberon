import { test } from "../base.config"
import { completeUiLoginWithOtp } from "./bootstrap"

test.describe("Shared auth setup", { tag: "@auth" }, () => {
  test("logs in and writes reusable browser state", async ({
    page,
    readLog,
    authEmail,
    authStorageStatePath,
  }) => {
    if (!authEmail) {
      throw new Error("authEmail fixture option must be provided")
    }

    if (!authStorageStatePath) {
      throw new Error("authStorageStatePath fixture option must be provided")
    }

    await completeUiLoginWithOtp({
      page,
      email: authEmail,
      getLog: readLog,
      storageStatePath: authStorageStatePath,
    })
  })
})
