import { test, expect } from "@playwright/test"

test.describe("@smoke /", () => {
  test("render with title", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/Oberon CMS/)

    await expect(
      page.getByRole("heading", { name: /Oberon CMS/ }),
    ).toBeVisible()
  })
})
