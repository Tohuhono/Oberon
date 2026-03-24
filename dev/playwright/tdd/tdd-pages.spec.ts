import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Pages TDD @tdd @pages @issue-308", () => {
  test("creates a page from the CMS list", async ({ cms, testKey }) => {
    const key = `/${testKey}_tdd_page`

    await cms.goto("/cms/pages")
    const textbox = cms.getByRole("textbox")
    await expect(textbox).toBeEditable()
    await textbox.fill(key)

    const addPageButton = cms.getByRole("button", { name: "Add Page" })
    await expect(addPageButton).toBeEnabled()
    await addPageButton.click()

    await expect(
      cms.getByRole("link", { name: key, exact: true }),
    ).toBeVisible()
    await expect(
      cms.getByLabel(`${key} updated by`, { exact: true }),
    ).toHaveText("test@tohuhono.com")

    await cms.goto("/cms/pages")
    await cms
      .getByRole("button", { name: `Delete ${key}`, exact: true })
      .click()
    await expect(cms.getByRole("link", { name: key, exact: true })).toHaveCount(
      0,
    )
  })

  test("publishes a seeded page from the editor", async ({
    cms,
    cmsSeededPageKey,
  }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await cms.getByRole("button", { name: "Publish" }).click()

    await cms.goto(cmsSeededPageKey)
    await expect(cms).toHaveURL(cmsSeededPageKey)
  })
})
