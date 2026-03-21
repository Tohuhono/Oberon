import {
  expect,
  test,
  type BrowserContext,
  type TestInfo,
} from "@playwright/test"
import { authenticatedProject } from "@dev/playwright/projects"
import { createPage, deletePages } from "./helpers/page-helpers"

const testPageKey = (testInfo: TestInfo) =>
  `/e2e_page_${testInfo.parallelIndex}_${testInfo.repeatEachIndex}`

const authStorageStatePath = authenticatedProject.use?.storageState

test.describe("CMS Pages Actions", { tag: "@cms" }, () => {
  test.describe.configure({ mode: "serial" })

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

  test("shows add page button", async ({ page }) => {
    await page.goto("/cms/pages")
    await expect(page.getByRole("button", { name: "Add Page" })).toBeVisible()
  })

  test("adds a page", async ({ page }, testInfo) => {
    const key = `${testPageKey(testInfo)}_add_page`
    await createPage(page, key)
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
