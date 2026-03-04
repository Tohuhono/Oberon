import { expect, test, type TestInfo } from "@playwright/test"
import { createPage, deletePages } from "./helpers/page-helpers"

const testPageKey = (testInfo: TestInfo) =>
  `/e2e_edit_${testInfo.parallelIndex}_${testInfo.repeatEachIndex}`

test.describe("CMS Edit Actions", { tag: "@cms" }, () => {
  test.beforeAll(async ({ browser }, testInfo) => {
    await createPage(browser, testPageKey(testInfo))
  })

  test.afterAll(async ({ browser }, testInfo) => {
    await deletePages(browser, testPageKey(testInfo))
  })

  test("publishes from editor", async ({ page }, testInfo) => {
    const key = testPageKey(testInfo)
    await page.goto(`/cms/edit${key}`)
    await page.getByRole("button", { name: "Publish" }).click()

    await page.goto(key)
    await expect(page).toHaveURL(key)
  })
})
