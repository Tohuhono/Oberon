import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Pages Actions", { tag: "@contract" }, () => {
  test("shows add page button", async ({ cms }) => {
    await cms.goto("/cms/pages")
    await expect(cms.getByRole("button", { name: "Add Page" })).toBeVisible()
  })

  test("adds a page", async ({ cms, testKey }) => {
    const key = `/${testKey}_add_page`

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

  test("copies a page", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto("/cms/pages")

    await cms
      .getByRole("button", { name: `Copy ${cmsSeededPageKey}`, exact: true })
      .click()

    await expect(
      cms.getByRole("link", { name: `${cmsSeededPageKey}_copy`, exact: true }),
    ).toBeVisible()

    await expect(
      cms.getByLabel(`${cmsSeededPageKey}_copy updated by`, { exact: true }),
    ).toBeVisible()
  })

  test("deletes a page", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto("/cms/pages")

    await cms
      .getByRole("button", { name: `Delete ${cmsSeededPageKey}`, exact: true })
      .click()

    await expect(
      cms.getByRole("link", { name: cmsSeededPageKey, exact: true }),
    ).not.toBeVisible()
  })
})
