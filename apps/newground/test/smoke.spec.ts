import { test, expect } from "@playwright/test"

test.describe("TanStack Playground Smoke Tests", { tag: "@smoke" }, () => {
  test("homepage renders the bootstrapped Oberon page", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("heading", { name: "Welcome to OberonCMS" })).toBeVisible()
  })

  test("CMS route returns not found until the provider slice", async ({ page }) => {
    const response = await page.goto("/cms")
    expect(response?.status()).toBe(404)
    await expect(page.getByText("404 - page not found")).toBeVisible()
  })

  test("CMS API route reaches the Oberon handler", async ({ request }) => {
    const response = await request.get("/cms/api/not-a-handler")
    expect(response.status()).toBe(405)
  })

  test("unknown public route returns not found", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-xyz")
    expect(response?.status()).toBe(404)
    await expect(page.getByText("404 - page not found")).toBeVisible()
  })
})
