import { test } from "@dev/playwright"
import { completeUiLoginWithOtp } from "@dev/playwright/helpers/bootstrap"
import { expect } from "@playwright/test"

test.describe("COA login behavior", { tag: "@login" }, () => {
  test("redirects to login and completes real OTP sign-in", async ({
    page,
    serverLog,
    authEmail,
    authStorageStatePath,
  }) => {
    if (!authEmail) {
      throw new Error("authEmail fixture option must be provided")
    }

    if (!authStorageStatePath) {
      throw new Error("authStorageStatePath fixture option must be provided")
    }

    await page.goto("/cms/pages")

    await expect.poll(() => new URL(page.url()).pathname).toBe("/cms/login")

    await completeUiLoginWithOtp({
      page,
      email: authEmail,
      getLog: serverLog.read,
      storageStatePath: authStorageStatePath,
    })

    await expect.poll(() => new URL(page.url()).pathname).toBe("/cms/pages")
  })
})
