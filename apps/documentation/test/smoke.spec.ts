import { test, expect } from "@playwright/test"

test.describe("Docs Smoke Tests @smoke", () => {
  test("homepage loads", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("docs index loads", async ({ page }) => {
    const response = await page.goto("/docs")
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("CMS route loads", async ({ page }) => {
    const response = await page.goto("/cms")
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("unknown route returns 404", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz")
    await expect(page.getByText("404 - page not found")).toBeVisible()
  })
})
