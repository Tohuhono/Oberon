import { expect, expectCmsPagePersisted, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Pages Actions", { tag: "@cms" }, () => {
  test("shows add page button", async ({ cms }) => {
    await cms.goto("/cms/pages")
    await expect(cms.getByRole("button", { name: "Add Page" })).toBeVisible()
  })

  test("adds a page", async ({ cms, cmsSeededPageKey }) => {
    await expect(cms.getByRole("link", { name: cmsSeededPageKey, exact: true })).toBeVisible()
    await expectCmsPagePersisted(cms, cmsSeededPageKey)
  })

  test("copies a page", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto("/cms/pages")

    await cms.getByRole("button", { name: `Copy ${cmsSeededPageKey}`, exact: true }).click()

    await expect(
      cms.getByRole("link", { name: `${cmsSeededPageKey}_copy`, exact: true }),
    ).toBeVisible()

    await expect(
      cms.getByLabel(`${cmsSeededPageKey}_copy updated by`, { exact: true }),
    ).toBeVisible()
  })

  test("deletes a page", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto("/cms/pages")

    await cms.getByRole("button", { name: `Delete ${cmsSeededPageKey}`, exact: true }).click()

    await expect(cms.getByRole("link", { name: cmsSeededPageKey, exact: true })).not.toBeVisible()
  })
})
