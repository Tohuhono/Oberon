import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("Public page rendering", { tag: ["@cms", "@playground"] }, () => {
  test.use({ javaScriptEnabled: false })

  test("renders the bootstrapped Page without JavaScript", async ({ page }) => {
    const response = await page.goto("/")

    expect(response?.status()).toBe(200)
    await expect(page.getByRole("heading", { name: "Welcome to OberonCMS" })).toBeVisible()
  })

  test("returns not found without JavaScript", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-xyz")

    expect(response?.status()).toBe(404)
  })
})
