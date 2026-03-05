import { expect, test, type TestInfo } from "@playwright/test"
import { createPage, deletePages } from "./helpers/page-helpers"

const testPageKey = (testInfo: TestInfo) =>
  `/e2e_page_${testInfo.parallelIndex}_${testInfo.repeatEachIndex}`

test.describe("CMS Pages Actions", { tag: "@cms" }, () => {
  test.describe.configure({ mode: "serial" })

  test.beforeAll(async ({ browser }, testInfo) =>
    createPage(browser, testPageKey(testInfo)),
  )

  test.afterAll(async ({ browser }, testInfo) =>
    deletePages(browser, testPageKey(testInfo)),
  )

  test("shows add page button", async ({ page }) => {
    await page.goto("/cms/pages")
    await expect(page.getByRole("button", { name: "Add Page" })).toBeVisible()
  })

  test("adds a page", async ({ browser }, testInfo) => {
    const key = `${testPageKey(testInfo)}_add_page`
    await createPage(browser, key)
  })

  test("copies a page", async ({ page }, testInfo) => {
    const key = testPageKey(testInfo)
    await page.goto("/cms/pages")

    await page.getByRole("button", { name: `Copy ${key}`, exact: true }).click()

    await expect(
      page.getByRole("link", { name: `${key}_copy`, exact: true }),
    ).toBeVisible()

    await expect(
      page.getByLabel(`${key}_copy updated by`, { exact: true }),
    ).toBeVisible()
  })

  test("deletes a page", async ({ page }, testInfo) => {
    const key = testPageKey(testInfo)
    await page.goto("/cms/pages")

    await page
      .getByRole("button", { name: `Delete ${key}`, exact: true })
      .click()

    await expect(
      page.getByRole("link", { name: key, exact: true }),
    ).not.toBeVisible()
  })
})
