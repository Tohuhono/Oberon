import { createCmsPage, deleteCmsPages, expect, test } from "@dev/playwright/helpers/fixtures"
import type { Page } from "@playwright/test"

import { insertComponent } from "../helpers/editor"

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
    "renders a published Shared component on a public Page",
    { tag: "@playground" },
    async ({ cms, page, testKey }) => {
      const name = `Shared ${testKey}`
      const text = `Shared text ${testKey}`
      const pageKey = `/${testKey}`

      try {
        const sourceId = await createSharedComponent(cms, name)
        await insertComponent(cms, "Text")
        await cms.getByRole("tab", { name: "Page Settings", exact: true }).click()
        await cms.locator('textarea[name="text"]').fill(text)
        await publishSharedComponent(cms, sourceId)

        await createCmsPage(cms, pageKey)
        await cms.goto(`/cms/edit${pageKey}`)
        await insertComponent(cms, `SharedPalette_${encodeURIComponent(sourceId)}`)
        await expect(
          cms.frameLocator("iframe#preview-frame").getByText(text, { exact: true }),
        ).toBeVisible()
        await cms.getByRole("button", { name: "Publish", exact: true }).click()
        await expect(
          cms.getByText(`Successfully published ${pageKey}`, { exact: true }),
        ).toBeVisible()

        const response = await page.goto(pageKey)
        expect(response?.status()).toBe(200)
        await expect(page.getByText(text, { exact: true })).toBeVisible()
      } finally {
        await deleteCmsPages(cms, pageKey)
        await deleteSharedComponent(cms, name)
      }
    },
  )
})
