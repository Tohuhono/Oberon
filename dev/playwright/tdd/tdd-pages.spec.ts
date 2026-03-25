import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Pages TDD @tdd @pages @issue-308 @issue-314", () => {
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
    cmsTailwindPageKey,
  }) => {
    await cms.goto(`/cms/edit${cmsTailwindPageKey}`)
    await cms.getByRole("button", { name: "Publish" }).click()

    await cms.goto(cmsTailwindPageKey)
    await expect(cms).toHaveURL(cmsTailwindPageKey)

    const tailwindLink = cms.locator(
      'link[rel="stylesheet"][href^="/cms/api/tailwind/"][href$=".css"]',
    )

    await expect(tailwindLink).toHaveCount(1)

    const href = await tailwindLink.first().getAttribute("href")

    expect(href).toMatch(/^\/cms\/api\/tailwind\/[a-f0-9]+\.css$/)

    const response = await cms.request.get(href || "")

    expect(response.status()).toBe(200)
    expect(response.headers()["cache-control"]).toContain("immutable")
    expect(response.headers()["content-type"]).toContain("text/css")
    await expect(response.text()).resolves.toContain(":root")
  })
})
