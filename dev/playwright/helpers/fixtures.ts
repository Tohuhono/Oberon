import {
  expect,
  type BrowserContext,
  type Page,
  type TestInfo,
} from "@playwright/test"
import { getClient } from "@oberoncms/plugin-development"
import { pages } from "@oberoncms/sqlite/schema"
import { eq } from "drizzle-orm"
import { test as base } from "../base.config"

function sanitizeKeyPart(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "test"
  )
}

function getTestKey(testInfo: TestInfo) {
  const fileName = testInfo.file.split("/").at(-1) ?? "spec"
  const fileKey = sanitizeKeyPart(fileName.replace(/\.spec\.[mc]?tsx?$/, ""))
  const titleKey = sanitizeKeyPart(testInfo.title)

  return `${fileKey}_${titleKey}_${testInfo.parallelIndex}_${testInfo.repeatEachIndex}_${testInfo.retry}_${testInfo.workerIndex}`
}

async function createCmsPage(page: Page, key: string) {
  await page.goto("/cms/pages")
  const textbox = page.getByRole("textbox")
  await expect(textbox).toBeEditable()
  await textbox.fill(key)
  const addPageButton = page.getByRole("button", { name: "Add Page" })
  await expect(addPageButton).toBeEnabled()
  await addPageButton.click()
  await expect(page.getByRole("link", { name: key, exact: true })).toBeVisible()
  await expect(
    page.getByLabel(`${key} updated by`, { exact: true }),
  ).toHaveText("test@tohuhono.com")
}

async function seedCmsTailwindPage(key: string) {
  const updatedAt = new Date()
  const data = {
    content: [
      {
        type: "Container",
        props: {
          id: "Container-1",
          className: "bg-red-500 md:grid",
        },
      },
    ],
    root: { props: { title: key } },
    zones: {},
  }

  await getClient()
    .insert(pages)
    .values({
      key,
      data,
      updatedAt,
      updatedBy: "test@tohuhono.com",
    })
    .onConflictDoUpdate({
      target: pages.key,
      set: {
        data,
        updatedAt,
        updatedBy: "test@tohuhono.com",
      },
    })
    .execute()
}

async function deleteCmsPageDirect(key: string) {
  await getClient().delete(pages).where(eq(pages.key, key)).execute()
}

async function deleteCmsPages(page: Page, key: string) {
  await page.goto("/cms/pages")

  const links = page.getByRole("link", { name: key })

  for (const _ of Array(await links.count())) {
    const pageKey = await links.first().innerText()
    expect(pageKey).toMatch(/.+/)
    await page
      .getByRole("button", { name: `Delete ${pageKey}`, exact: true })
      .click()
    await expect(
      page.getByRole("link", { name: pageKey, exact: true }),
    ).not.toBeVisible()
  }

  expect(await links.count()).toBe(0)
}

export const test = base.extend<{
  cmsContext: BrowserContext
  cms: Page
  testKey: string
  cmsSeededPageKey: string
  cmsTailwindPageKey: string
}>({
  cmsContext: async ({ browser, authStorageStatePath }, use) => {
    if (!authStorageStatePath) {
      throw new Error("authStorageStatePath fixture option must be provided")
    }

    const context = await browser.newContext({
      storageState: authStorageStatePath,
    })

    await use(context)
    await context.close()
  },

  cms: async ({ cmsContext }, use) => {
    const cmsPage = await cmsContext.newPage()
    await use(cmsPage)
    await cmsPage.close()
  },

  testKey: async ({ browser: _browser }, use, testInfo) => {
    const key = getTestKey(testInfo)
    await use(key)
  },

  cmsSeededPageKey: async ({ cms, testKey }, use) => {
    const key = `/${testKey}`

    await createCmsPage(cms, key)
    await use(key)
    await deleteCmsPages(cms, key)
  },

  cmsTailwindPageKey: async ({ testKey }, use) => {
    const key = `/${testKey}_tailwind`

    await seedCmsTailwindPage(key)
    await use(key)
    await deleteCmsPageDirect(key)
  },
})

export { expect }
