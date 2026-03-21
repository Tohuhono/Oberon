import { expect, test } from "@playwright/test"

test.describe("CMS Routes", { tag: "@cms" }, () => {
  test("redirects /cms to /cms/pages", async ({ page }) => {
    await page.goto("/cms")
    await expect(page).toHaveURL(/\/cms\/pages$/)
  })

  test("loads /cms/site", async ({ page }) => {
    await page.goto("/cms/site")
    await expect(page.getByRole("link", { name: "Oberon CMS" })).toBeVisible()
  })

  test("loads /cms/pages", async ({ page }) => {
    await page.goto("/cms/pages")
    await expect(page.getByRole("link", { name: "Manage Pages" })).toBeVisible()
  })

  test("loads /cms/images", async ({ page }) => {
    await page.goto("/cms/images")
    await expect(
      page.getByRole("link", { name: "Manage Images" }),
    ).toBeVisible()
  })

  test("loads /cms/users", async ({ page }) => {
    await page.goto("/cms/users")
    await expect(page.getByRole("link", { name: "Manage Users" })).toBeVisible()
  })

  test("loads /cms/edit", async ({ page }) => {
    await page.goto("/cms/edit")
    await expect(page.getByRole("link", { name: "/" })).toBeVisible()
  })

  test("shows 404 for unknown cms route", async ({ page }) => {
    await page.goto("/cms/unknown-route")
    await expect(page.getByText(/404 - page not found/i)).toBeVisible()
  })
})
