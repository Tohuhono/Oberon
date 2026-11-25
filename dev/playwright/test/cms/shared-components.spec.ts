import { createCmsPage, deleteCmsPages, expect, test } from "@dev/playwright/helpers/fixtures"
import type { Page } from "@playwright/test"

import { dragComponent, insertComponent, insertTextComponent } from "../helpers/editor"

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
    const name = `Shared ${testKey} ${crypto.randomUUID().slice(0, 8)}`

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
      const runId = crypto.randomUUID().slice(0, 8)
      const name = `Shared ${runId}`
      const text = `Shared text ${testKey}`
      const pageKey = `/${testKey}-${runId}`

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
            await insertComponent(cms, name)
          }
          await expect(instance).toBeVisible({ timeout: 2_000 })
        }).toPass({ timeout: 15_000 })
        const canvas = cms.frameLocator("iframe#preview-frame")
        await instance.click()
        await canvas.getByRole("button", { name: "Duplicate", exact: true }).click()
        await expect(instance).toHaveCount(2)
        await cms.waitForTimeout(300)
        await instance.last().click()
        await cms.keyboard.press("Delete")
        await expect(instance).toHaveCount(1)
        await cms.waitForTimeout(300)
        await cms.getByRole("button", { name: "Undo", exact: true }).click()
        await expect(instance).toHaveCount(2)
        await cms.getByRole("button", { name: "Redo", exact: true }).click()
        await expect(instance).toHaveCount(1)
        await instance.click()
        await cms.getByRole("link", { name: "Edit Shared source", exact: true }).click()
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

  test(
    "keeps Article slot children separate in the editor, Preview and published Page",
    { tag: "@playground" },
    async ({ cms, page, testKey }, testInfo) => {
      testInfo.setTimeout(90_000)
      const runId = crypto.randomUUID().slice(0, 8)
      const name = `Article ${runId}`
      const heading = `Article heading ${runId}`
      const revisedHeading = `Revised heading ${runId}`
      const pageKey = `/${testKey}-${runId}`
      const canvas = cms.frameLocator("iframe#preview-frame")
      const text = cms.locator('textarea[name="text"]')

      try {
        const key = await createSharedComponent(cms, name)
        await insertComponent(cms, "Container")
        await insertComponent(cms, "Text", canvas.getByTestId(/^dropzone:Container-.*:content$/u))
        await text.fill(heading)
        await insertComponent(cms, "Container")
        await cms.getByRole("switch", { name: "Expose content", exact: true }).click()
        await expect(
          cms.getByText("Children belong to each instance", { exact: true }),
        ).toBeVisible()
        // Puck groups changes made within its 250 ms history debounce.
        await cms.waitForTimeout(300)
        await cms.getByLabel("Prop label", { exact: true }).fill("Body")
        await cms.waitForTimeout(300)
        await cms.getByRole("button", { name: "Undo", exact: true }).click()
        await expect(cms.getByLabel("Prop label", { exact: true })).toHaveValue("content")
        await cms.getByRole("button", { name: "Redo", exact: true }).click()
        await expect(cms.getByLabel("Prop label", { exact: true })).toHaveValue("Body")
        await insertTextComponent(cms)
        await text.fill("Article caption")
        await cms.getByRole("switch", { name: "Expose text", exact: true }).click()
        await cms.getByLabel("Prop label", { exact: true }).fill("Caption")
        await publishSharedComponent(cms, key)

        await createCmsPage(cms, pageKey)
        await cms.goto(`/cms/edit${pageKey}`)
        const containers = canvas.getByTestId(/^dropzone:Container-.*:content$/u)
        for (let count = 1; count <= 3; count++) {
          await insertComponent(cms, "Container")
          await expect(containers).toHaveCount(count)
        }
        await insertComponent(cms, name, containers.nth(0))
        await insertComponent(cms, name, containers.nth(1))

        const bodies = canvas.getByTestId(/^dropzone:SharedPalette_.*:instance_/u)
        await expect(bodies).toHaveCount(2)
        for (const [index, content] of ["First body", "Second body"].entries()) {
          await insertComponent(cms, "Text", bodies.nth(index))
          await text.fill(content)
          await expect(bodies.nth(index).getByText(content, { exact: true })).toBeVisible()
        }
        for (const caption of ["First caption", "Second caption"]) {
          await canvas.getByText("Article caption", { exact: true }).first().click()
          await cms.locator('textarea[name^="instance_"]').fill(caption)
          await expect(canvas.getByText(caption, { exact: true })).toBeVisible()
        }

        const destination = containers.nth(2)
        await dragComponent(
          cms,
          containers.nth(0).getByText(heading, { exact: true }),
          destination,
          true,
        )
        await expect(destination.getByText("First body", { exact: true })).toBeVisible()
        await expect(containers.nth(0).getByText(heading, { exact: true })).toHaveCount(0)

        await cms.getByRole("button", { name: "Publish", exact: true }).click()
        await expect(
          cms.getByText(`Successfully published ${pageKey}`, { exact: true }),
        ).toBeVisible()
        const firstResponse = await page.goto(pageKey)
        expect(firstResponse?.status()).toBe(200)
        await expect(page.getByText(heading, { exact: true })).toHaveCount(2)

        await canvas.getByText(heading, { exact: true }).first().click()
        await cms.getByRole("link", { name: "Edit Shared source", exact: true }).click()
        await expect(cms.getByRole("button", { name: "Publish source", exact: true })).toBeVisible()
        await expect(canvas.getByText(heading, { exact: true })).toHaveCount(1)
        await canvas.getByText(heading, { exact: true }).click()
        await cms.getByRole("tab", { name: "Page Settings", exact: true }).click()
        await text.fill(revisedHeading)
        await publishSharedComponent(cms, key)
        await cms.getByRole("button", { name: "Back to Page", exact: true }).click()

        await expect(canvas.getByText(revisedHeading, { exact: true })).toHaveCount(2)
        await expect(canvas.getByText("First body", { exact: true })).toHaveCount(1)
        await expect(canvas.getByText("Second body", { exact: true })).toHaveCount(1)
        await expect(canvas.getByText("First caption", { exact: true })).toBeVisible()
        await expect(canvas.getByText("Second caption", { exact: true })).toBeVisible()

        await cms.goto(`/cms/preview${pageKey}`)
        await expect(cms.getByText(revisedHeading, { exact: true })).toHaveCount(2)
        await expect(cms.getByText("First body", { exact: true })).toBeVisible()
        await expect(cms.getByText("Second body", { exact: true })).toBeVisible()
        await expect(cms.getByText("First caption", { exact: true })).toBeVisible()
        await expect(cms.getByText("Second caption", { exact: true })).toBeVisible()

        const response = await page.goto(pageKey)
        expect(response?.status()).toBe(200)
        await expect(page.getByText(revisedHeading, { exact: true })).toHaveCount(2)
        await expect(page.getByText("First body", { exact: true })).toBeVisible()
        await expect(page.getByText("Second body", { exact: true })).toBeVisible()
        await expect(page.getByText("First caption", { exact: true })).toBeVisible()
        await expect(page.getByText("Second caption", { exact: true })).toBeVisible()
      } finally {
        if (!cms.isClosed()) {
          await deleteCmsPages(cms, pageKey)
          await deleteSharedComponent(cms, name)
        }
      }
    },
  )
})
