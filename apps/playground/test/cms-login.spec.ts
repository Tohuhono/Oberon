import { expect, test } from "@playwright/test"
import { loginThroughUiWithOtp } from "../../../packages/create-oberon-app/test/coa-auth"

test.describe("COA login behavior", { tag: "@login" }, () => {
  test("redirects to login and completes real OTP sign-in", async ({
    page,
  }) => {
    await page.goto("/cms/pages")

    await expect.poll(() => new URL(page.url()).pathname).toBe("/cms/login")

    await loginThroughUiWithOtp({ page })

    await expect.poll(() => new URL(page.url()).pathname).toBe("/cms/pages")
  })
})
