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

  test("publishes a text component with a className", async ({ cms }) => {
    await cms.goto("/cms/pages")

    const existingCopies = cms.getByRole("link", { name: /^\/_copy(?:_\d+)?$/ })
    for (const _ of Array(await existingCopies.count())) {
      const existingCopyKey = await existingCopies.first().innerText()
      await cms
        .getByRole("button", { name: `Delete ${existingCopyKey}`, exact: true })
        .click()
      await expect(
        cms.getByRole("link", { name: existingCopyKey, exact: true }),
      ).toHaveCount(0)
    }

    await cms.getByRole("button", { name: "Copy /", exact: true }).click()

    const copiedPageLink = cms.getByRole("link", { name: /^\/_copy(?:_\d+)?$/ })
    await expect(copiedPageLink).toHaveCount(1)
    const copiedPageKey = await copiedPageLink.first().innerText()
    await expect(
      cms.getByLabel(`${copiedPageKey} updated by`, { exact: true }),
    ).toHaveText("test@tohuhono.com")

    await cms.goto(`/cms/edit${copiedPageKey}`)
    await cms.locator("li", { hasText: "Outline" }).first().click()
    await cms.getByRole("button", { name: "Text" }).last().click()
    await cms.locator('input[name="className"]:visible').fill("p-1")

    await cms.getByRole("button", { name: "Publish" }).click()

    const browserErrors: string[] = []
    cms.on("pageerror", (error) => {
      browserErrors.push(error.message)
    })
    cms.on("console", (message) => {
      if (message.type() === "error") {
        browserErrors.push(message.text())
      }
    })

    await cms.goto(copiedPageKey)
    await expect(cms).toHaveURL(copiedPageKey)
    await expect(
      cms.getByRole("heading", { name: "Welcome to OberonCMS" }),
    ).toBeVisible()
    expect(browserErrors).toEqual([])

    await cms.goto("/cms/pages")
    await cms
      .getByRole("button", { name: `Delete ${copiedPageKey}`, exact: true })
      .click()
  })
})
