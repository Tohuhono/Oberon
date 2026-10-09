import { test, expect } from "@playwright/test"

test.describe("Smoke Tests", { tag: "@smoke" }, () => {
  test("homepage loads", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
  })

  test("CMS route loads", async ({ page }) => {
    const response = await page.goto("/cms")
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("unknown route returns 404", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-xyz")
    expect(response?.status()).toBe(404)
    await expect(page.getByText("404 - page not found")).toBeVisible()
  })
})

test.describe("CMS Smoke Tests", { tag: ["@smoke", "@cms", "@playground"] }, () => {
  test("cms homepage loads", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("heading", { name: "Welcome to OberonCMS" })).toBeVisible()
  })

  test("not-found page respects the saved theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await page.addInitScript(() => localStorage.setItem("oberon:theme", "dark"))

    const response = await page.goto("/nonexistent-page-xyz/theme-regression")
    expect(response?.status()).toBe(404)

    await expect(
      page.getByRole("heading", { name: "404 - page not found", level: 1, exact: true }),
    ).toBeVisible()
    await expect(page.locator("html")).toHaveClass(/\bdark\b/)
  })
})

test.describe("Docs Smoke Tests", { tag: ["@smoke", "@docs"] }, () => {
  test("docs index loads", async ({ page }) => {
    const response = await page.goto("/docs")
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  for (const { path, heading } of [
    { path: "/docs/configuration", heading: "Configuration" },
    { path: "/docs/plugins/custom/plugin-shape", heading: "Plugin shape" },
  ]) {
    test(`${path} loads`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible()
    })
  }

  test("duplicated docs prefix returns 404", async ({ page }) => {
    const response = await page.goto("/docs/docs/configuration")
    expect(response?.status()).toBe(404)
    await expect(page.getByText("404 - page not found")).toBeVisible()
  })
})
