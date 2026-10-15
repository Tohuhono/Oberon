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

  test("redirects to login, keeps the session after reload, and signs out", async ({
    page,
    serverLog,
    authEmail,
  }, testInfo) => {
    if (!authEmail) {
      throw new Error("authEmail fixture option must be provided")
    }

    await page.goto("/cms/pages")

    await expect.poll(() => new URL(page.url()).pathname).toBe("/cms/login")

    await completeUiLoginWithOtp({
      page,
      email: authEmail,
      getLog: serverLog.read,
      storageStatePath: testInfo.outputPath("sign-out-session.json"),
    })

    await expect.poll(() => new URL(page.url()).pathname).toBe("/cms/pages")
    await page.reload()
    const signOut = page.getByRole("button", { name: "Sign Out", exact: true })
    await expect(signOut).toBeVisible()
    await expect(page).toHaveURL("/cms/pages")
    await signOut.click()

    await expect
      .poll(async () => {
        const response = await page.request.get("/cms/pages")
        return new URL(response.url()).pathname
      })
      .toBe("/cms/login")
    await page.reload()
    await expect.poll(() => new URL(page.url()).pathname).toBe("/cms/login")
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible()
  })
})
