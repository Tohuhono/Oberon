import { createCmsPage, deleteCmsPages, expect, test } from "@dev/playwright/helpers/fixtures"
import type { Page } from "@playwright/test"

import { insertComponent, insertTextComponent } from "../helpers/editor"

async function createSharedComponent(cms: Page, name: string) {
  await cms.goto("/cms/library")
  await cms.getByRole("button", { name: "+ New Shared component", exact: true }).click()
  await expect(cms.getByRole("button", { name: "Create Shared component" })).toBeDisabled()
  await cms.getByLabel("Shared component name", { exact: true }).fill(name)
  await cms.getByRole("button", { name: "Create Shared component", exact: true }).click()
  await expect(cms).toHaveURL(/\/cms\/library\?source=/u)

  const sourceId = new URL(cms.url()).searchParams.get("source")
  if (!sourceId) {
    throw new Error("Creating a Shared component must open its source editor")
  }

  await expect(cms.getByLabel("Shared component name", { exact: true })).toHaveValue(name)
  return sourceId
}

async function publishSharedComponent(cms: Page, sourceId: string) {
  await cms.getByRole("button", { name: "Publish source", exact: true }).click()
  await expect(
    cms.getByText(`Successfully published shared ${sourceId}`, { exact: true }),
  ).toBeVisible()
}

function getSharedComponentCard(cms: Page, name: string) {
  return cms.locator("article").filter({
    has: cms.getByRole("heading", { name, exact: true }),
  })
}

async function deleteSharedComponent(cms: Page, name: string) {
  await cms.goto("/cms/library")
  const card = getSharedComponentCard(cms, name)
  if (await card.count()) {
    await card.getByRole("button", { name: "Delete", exact: true }).click()
    await cms.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click()
    await expect(card).toHaveCount(0)
  }
}

test.describe("CMS Shared components", { tag: "@cms" }, () => {
  test("creates, publishes and deletes a Shared component", async ({ cms, testKey }) => {
    const name = `Shared ${testKey}`

    try {
      const sourceId = await createSharedComponent(cms, name)
      await expect(cms.getByText("Shared component source", { exact: true })).toBeVisible()
      await publishSharedComponent(cms, sourceId)
      await cms.getByRole("button", { name: "Back to library", exact: true }).click()

      const card = getSharedComponentCard(cms, name)
      await expect(card).toBeVisible()
      await expect(card.getByText("Fully shared", { exact: true })).toBeVisible()
      await card.getByRole("button", { name: "Delete", exact: true }).click()
      await cms.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click()
      await expect(card).toHaveCount(0)
    } finally {
      await deleteSharedComponent(cms, name)
    }
  })

  test(
    "restores a Page draft from source editing and renders the published Shared component",
    { tag: "@playground" },
    async ({ cms, page, testKey }, testInfo) => {
      testInfo.setTimeout(60_000)
      const name = `Shared ${testKey}`
      const text = `Shared text ${testKey}`
      const pageKey = `/${testKey}`

      try {
        const sourceId = await createSharedComponent(cms, name)
        const textInput = cms.locator('textarea[name="text"]')
        await expect(async () => {
          if (!(await textInput.isVisible())) await insertTextComponent(cms)
        }).toPass({ timeout: 15_000 })
        await textInput.fill(text)
        await publishSharedComponent(cms, sourceId)

        await createCmsPage(cms, pageKey)
        await cms.goto(`/cms/edit${pageKey}`)
        const instance = cms.frameLocator("iframe#preview-frame").getByText(text, { exact: true })
        await expect(async () => {
          if (!(await instance.isVisible())) {
            await insertComponent(cms, `SharedPalette_${encodeURIComponent(sourceId)}`)
          }
          await expect(instance).toBeVisible({ timeout: 2_000 })
        }).toPass({ timeout: 15_000 })
        const sourceQuery = new URLSearchParams({
          source: sourceId,
          returnTo: `/cms/edit${pageKey}`,
        })
        await cms.goto(`/cms/library?${sourceQuery}`, { waitUntil: "domcontentloaded" })
        const backToPage = cms.getByRole("button", { name: "Back to Page", exact: true })
        await expect(backToPage).toBeVisible()
        await backToPage.click()
        await expect(cms).toHaveURL(new RegExp(`/cms/edit${pageKey}$`, "u"))
        await expect(
          cms.frameLocator("iframe#preview-frame").getByText(text, { exact: true }),
        ).toBeVisible()

        await cms.getByRole("button", { name: "Publish", exact: true }).click()
        await expect(
          cms.getByText(`Successfully published ${pageKey}`, { exact: true }),
        ).toBeVisible()

        const response = await page.goto(pageKey, { waitUntil: "domcontentloaded" })
        expect(response?.status()).toBe(200)
        await expect(page.getByText(text, { exact: true })).toBeVisible()
      } finally {
        if (!cms.isClosed()) {
          await deleteCmsPages(cms, pageKey)
          await deleteSharedComponent(cms, name)
        }
      }
    },
  )
})
