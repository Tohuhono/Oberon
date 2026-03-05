import { expect, test } from "@playwright/test"

test.describe("CMS Images & Site Actions", { tag: "@cms" }, () => {
  test.skip("deletes an image from cms images page", async ({ page }) => {
    // TODO: seed image via CMS upload UI (requires UploadThing flow)
    await page.goto("/cms/images")
  })

  test("shows no pending migrations on site page", async ({ page }) => {
    await page.goto("/cms/site")

    await expect(page.getByText("No pending migrations")).toBeVisible()
  })
})
