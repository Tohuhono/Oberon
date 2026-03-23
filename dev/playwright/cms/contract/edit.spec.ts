import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Edit Actions", { tag: "@contract" }, () => {
  test("publishes from editor", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await cms.getByRole("button", { name: "Publish" }).click()

    await cms.goto(cmsSeededPageKey)
    await expect(cms).toHaveURL(cmsSeededPageKey)
  })
})
