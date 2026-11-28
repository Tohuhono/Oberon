import {
  createCmsPage,
  deleteCmsPages,
  expect,
  test as base,
} from "@dev/playwright/helpers/fixtures"
import type { Page } from "@playwright/test"

import { dragComponent, insertComponent, insertTextComponent } from "../helpers/editor"

async function createSharedComponent(cms: Page, name: string) {
  await cms.goto("/cms/library")
  await cms.getByRole("button", { name: "+ New Shared component", exact: true }).click()
  const dialog = cms.getByRole("dialog", { name: "New Shared component" })
  const create = dialog.getByRole("button", { name: "Create Shared component", exact: true })
  await expect(create).toBeDisabled()
  await dialog.getByRole("textbox", { name: "Shared component name", exact: true }).fill(name)
  await create.click()
  await expect(cms.getByRole("button", { name: "Publish source", exact: true })).toBeVisible()
  await expect(cms.getByLabel("Shared component name", { exact: true })).toHaveValue(name)
}

async function publishSharedComponent(cms: Page) {
  await cms.getByRole("button", { name: "Publish source", exact: true }).click()
  await expect(cms.getByText(/^Successfully published shared /u)).toBeVisible()
}

function getSharedComponentCard(cms: Page, name: string) {
  return cms.getByRole("article").filter({
    has: cms.getByRole("heading", { name, exact: true }),
  })
}

async function deleteSharedComponent(card: ReturnType<typeof getSharedComponentCard>, cms: Page) {
  await card.getByRole("button", { name: "Delete", exact: true }).click()
  const confirmation = cms.getByRole("dialog", { name: "Delete Shared component?" })
  await confirmation.getByRole("button", { name: "Delete", exact: true }).click()
  await expect(card).toHaveCount(0)
}

const test = base.extend<{ sharedName: string; consumerPageKey: string }>({
  sharedName: async ({ cms }, use) => {
    const name = `Shared ${crypto.randomUUID()}`
    await use(name)
    await cms.goto("/cms/library")
    await expect(cms.getByRole("heading", { name: "Shared components", exact: true })).toBeVisible()
    const card = getSharedComponentCard(cms, name)
    if (await card.count()) await deleteSharedComponent(card, cms)
  },
  consumerPageKey: async ({ cms, sharedName }, use) => {
    const key = `/${sharedName.toLowerCase().replaceAll(" ", "-")}`
    try {
      await createCmsPage(cms, key)
      await use(key)
    } finally {
      await deleteCmsPages(cms, key)
    }
  },
})

test.describe("CMS Shared components", { tag: "@cms" }, () => {
  test("creates, publishes and deletes a Shared component", async ({ cms, sharedName }) => {
    await createSharedComponent(cms, sharedName)
    await publishSharedComponent(cms)
    await cms.getByRole("button", { name: "Back to library", exact: true }).click()
    const card = getSharedComponentCard(cms, sharedName)
    await expect(card.getByText("Fully shared", { exact: true })).toBeVisible()
    await deleteSharedComponent(card, cms)
  })

  test(
    "restores a Page draft from source editing and renders the published Shared component",
    { tag: "@playground" },
    async ({ cms, page, sharedName, consumerPageKey: pageKey }, testInfo) => {
      testInfo.setTimeout(60_000)
      const text = `Text from ${sharedName}`
      const canvas = cms.frameLocator("iframe#preview-frame")
      const instance = canvas.getByText(text, { exact: true })

      await createSharedComponent(cms, sharedName)
      await insertTextComponent(cms)
      await cms.getByRole("textbox", { name: "text", exact: true }).fill(text)
      await publishSharedComponent(cms)

      await cms.goto(`/cms/edit${pageKey}`)
      await insertComponent(cms, sharedName)
      await expect(instance).toBeVisible()
      await instance.click()
      await cms.getByRole("link", { name: "Edit Shared source", exact: true }).click()
      const backToPage = cms.getByRole("button", { name: "Back to Page", exact: true })
      await expect(backToPage).toBeVisible()
      await backToPage.click()
      await expect(cms).toHaveURL(`/cms/edit${pageKey}`)
      await expect(instance).toBeVisible()

      await cms.getByRole("button", { name: "Publish", exact: true }).click()
      await expect(
        cms.getByText(`Successfully published ${pageKey}`, { exact: true }),
      ).toBeVisible()

      const response = await page.goto(pageKey, { waitUntil: "domcontentloaded" })
      expect(response?.status()).toBe(200)
      await expect(page.getByText(text, { exact: true })).toBeVisible()
    },
  )

  test(
    "duplicates and deletes a Shared component instance with Undo and Redo",
    { tag: "@playground" },
    async ({ cms, sharedName, consumerPageKey: pageKey }) => {
      const text = `Text from ${sharedName}`
      await createSharedComponent(cms, sharedName)
      await insertTextComponent(cms)
      await cms.getByRole("textbox", { name: "text", exact: true }).fill(text)
      await publishSharedComponent(cms)

      await cms.clock.install()
      await cms.goto(`/cms/edit${pageKey}`)
      const canvas = cms.frameLocator("iframe#preview-frame")
      const instance = canvas.getByText(text, { exact: true })
      await insertComponent(cms, sharedName)
      await expect(instance).toBeVisible()
      await instance.click()
      await canvas.getByRole("button", { name: "Duplicate", exact: true }).click()
      await expect(instance).toHaveCount(2)
      // Puck groups changes made within its 250 ms history debounce.
      await cms.clock.runFor(250)
      await instance.last().click()
      await cms.keyboard.press("Delete")
      await expect(instance).toHaveCount(1)
      await cms.clock.runFor(250)
      await cms.getByRole("button", { name: "Undo", exact: true }).click()
      await expect(instance).toHaveCount(2)
      await cms.getByRole("button", { name: "Redo", exact: true }).click()
      await expect(instance).toHaveCount(1)
    },
  )

  test(
    "undoes and redoes a change to an Exposed prop label",
    { tag: "@playground" },
    async ({ cms, sharedName }) => {
      await cms.clock.install()
      await createSharedComponent(cms, sharedName)
      await insertComponent(cms, "Container")
      await cms.getByRole("switch", { name: "Expose content", exact: true }).click()
      const label = cms.getByRole("textbox", { name: "Prop label", exact: true })
      await expect(label).toHaveValue("content")
      // Puck groups changes made within its 250 ms history debounce.
      await cms.clock.runFor(250)
      await label.fill("Body")
      await cms.clock.runFor(250)
      await cms.getByRole("button", { name: "Undo", exact: true }).click()
      await expect(label).toHaveValue("content")
      await cms.getByRole("button", { name: "Redo", exact: true }).click()
      await expect(label).toHaveValue("Body")
    },
  )

  test(
    "keeps Article slot children separate in the editor, Preview and published Page",
    { tag: "@playground" },
    async ({ cms, page, sharedName, consumerPageKey: pageKey }, testInfo) => {
      testInfo.setTimeout(90_000)
      const heading = "Article heading"
      const revisedHeading = "Revised article heading"
      const canvas = cms.frameLocator("iframe#preview-frame")
      const text = cms.getByRole("textbox", { name: "text", exact: true })
      const containers = canvas.getByTestId(/^dropzone:Container-.*:content$/u)

      await createSharedComponent(cms, sharedName)
      await insertComponent(cms, "Container")
      await insertComponent(cms, "Text", containers)
      await text.fill(heading)
      await insertComponent(cms, "Container")
      await cms.getByRole("switch", { name: "Expose content", exact: true }).click()
      await expect(cms.getByText("Children belong to each instance", { exact: true })).toBeVisible()
      await cms.getByRole("textbox", { name: "Prop label", exact: true }).fill("Body")
      await insertTextComponent(cms)
      await text.fill("Article caption")
      await cms.getByRole("switch", { name: "Expose text", exact: true }).click()
      await cms.getByLabel("Prop label", { exact: true }).fill("Caption")
      await publishSharedComponent(cms)

      await cms.goto(`/cms/edit${pageKey}`)
      for (let count = 1; count <= 3; count++) {
        await insertComponent(cms, "Container")
        await expect(containers).toHaveCount(count)
      }
      await insertComponent(cms, sharedName, containers.nth(0))
      await insertComponent(cms, sharedName, containers.nth(1))

      const bodies = canvas.getByTestId(/^dropzone:SharedPalette_.*:instance_/u)
      await expect(bodies).toHaveCount(2)
      for (const [index, content] of ["First body", "Second body"].entries()) {
        await insertComponent(cms, "Text", bodies.nth(index))
        await text.fill(content)
        await expect(bodies.nth(index).getByText(content, { exact: true })).toBeVisible()
      }
      for (const [index, caption] of ["First caption", "Second caption"].entries()) {
        const instance = containers.nth(index)
        await instance.getByText("Article caption", { exact: true }).click()
        await cms.getByRole("textbox", { name: "Caption", exact: true }).fill(caption)
        await expect(instance.getByText(caption, { exact: true })).toBeVisible()
      }

      const destination = containers.nth(2)
      await dragComponent(
        cms,
        containers.nth(0).getByText(heading, { exact: true }),
        destination,
        true,
      )
      await expect(destination.getByText("First body", { exact: true })).toBeVisible()
      await expect(destination.getByText("First caption", { exact: true })).toBeVisible()
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
      await publishSharedComponent(cms)
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
    },
  )
})
