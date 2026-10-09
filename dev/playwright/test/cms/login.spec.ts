import { test } from "@dev/playwright"
import { completeUiLoginWithOtp } from "@dev/playwright/helpers/bootstrap"
import { expect } from "@playwright/test"

test.describe("CMS Login Behavior", { tag: "@login" }, () => {
  test("starts a fresh form when client navigation changes URL credentials", async ({ page }) => {
    const finalUrl = "/cms/login?email=third%40example.com"
    const nextUrl = `/cms/login?${new URLSearchParams({
      email: "second@example.com",
      token: "222222",
      callbackUrl: finalUrl,
    })}`
    const initialUrl = `/cms/login?${new URLSearchParams({
      email: "first@example.com",
      token: "111111",
      callbackUrl: nextUrl,
    })}`

    await page.route("**/cms/api/auth/sign-in/email-otp", (route) =>
      route.fulfill({ status: 200, json: {} }),
    )
    await page.goto(initialUrl)

    const emailInput = page.getByRole("textbox").first()
    const tokenInput = page.locator('input[data-input-otp="true"]')
    const completeButton = page.getByRole("button", { name: "Complete Sign in" })

    await expect(emailInput).toHaveValue("first@example.com")
    await tokenInput.fill("654321")
    await completeButton.click()

    await expect(emailInput).toHaveValue("second@example.com")
    await expect(tokenInput).toHaveValue("222222")
    await expect(completeButton).toBeEnabled()
    await completeButton.click()

    await expect(emailInput).toHaveValue("third@example.com")
    await expect(tokenInput).toBeHidden()
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible()
  })

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
