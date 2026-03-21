import {
  expect,
  test,
  type BrowserContext,
  type TestInfo,
} from "@playwright/test"
import { authenticatedProject } from "@dev/playwright/projects"
import { createPage, deletePages } from "./helpers/page-helpers"

const testPageKey = (testInfo: TestInfo) =>
  `/e2e_edit_${testInfo.parallelIndex}_${testInfo.repeatEachIndex}`

const authStorageStatePath = authenticatedProject.use?.storageState

test.describe("CMS Edit Actions", { tag: "@cms" }, () => {
  let authenticatedContext: BrowserContext | null = null

  test.beforeAll(async ({ browser }, testInfo) => {
    if (!authStorageStatePath) {
      throw new Error("authStorageStatePath fixture option must be provided")
    }

    authenticatedContext = await browser.newContext({
      storageState: authStorageStatePath,
    })

    const page = await authenticatedContext.newPage()
    await createPage(page, testPageKey(testInfo))
    await page.close()
  })

  test.afterAll(async ({}, testInfo) => {
    if (!authenticatedContext) {
      return
    }

    const page = await authenticatedContext.newPage()
    await deletePages(page, testPageKey(testInfo))
    await page.close()

    await authenticatedContext.close()
    authenticatedContext = null
  })

  test("publishes from editor", async ({ page }, testInfo) => {
    const key = testPageKey(testInfo)
    await page.goto(`/cms/edit${key}`)
    await page.getByRole("button", { name: "Publish" }).click()

    await page.goto(key)
    await expect(page).toHaveURL(key)
  })
})
