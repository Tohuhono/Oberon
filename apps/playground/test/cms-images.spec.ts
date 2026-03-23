import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Images & Site Actions", { tag: "@cms" }, () => {
  test.skip("deletes an image from cms images page", async ({ cms }) => {
    // TODO: seed image via CMS upload UI (requires UploadThing flow)
    await cms.goto("/cms/images")
  })

  test("shows no pending migrations on site page", async ({ cms }) => {
    await cms.goto("/cms/site")

    await expect(cms.getByText("No pending migrations")).toBeVisible()
  })
})
