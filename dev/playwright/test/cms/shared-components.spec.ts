import { expect, test } from "@dev/playwright/helpers/fixtures"
import { FragmentDataSchema } from "@oberoncms/core"
import type { Page } from "@playwright/test"
import { z } from "zod"

import { insertComponent, moveComponent } from "../helpers/editor"

test.use({ trace: "retain-on-failure" })

const endpoint = "/cms/api/shared-components"
const SourceSchema = z.object({
  id: z.string(),
  data: FragmentDataSchema,
  updatedAt: z.string(),
})
const LibrarySchema = z.object({ definitions: z.array(SourceSchema) })

async function library(cms: Page) {
  const response = await cms.request.get(endpoint)
  expect(response.status()).toBe(200)
  return LibrarySchema.parse(await response.json()).definitions
}

async function publishSource(
  cms: Page,
  id: string,
  data: z.infer<typeof FragmentDataSchema>,
  expectedUpdatedAt: string | null = null,
) {
  const response = await cms.request.post(endpoint, {
    data: { id, data, expectedUpdatedAt },
  })
  expect(response.status(), await response.text()).toBe(200)
  const source = LibrarySchema.parse(await response.json()).definitions.find(
    (definition) => definition.id === id,
  )
  if (!source) throw new Error(`Missing published source "${id}"`)
  return source
}

async function deleteSources(cms: Page, ids: string[]) {
  for (const id of ids.toReversed()) {
    const source = (await library(cms)).find((definition) => definition.id === id)
    if (!source) continue
    const response = await cms.request.delete(endpoint, {
      data: { id, expectedUpdatedAt: source.updatedAt },
    })
    expect(response.status(), await response.text()).toBe(200)
  }
}

async function deleteConsumer(cms: Page, key: string) {
  await cms.goto("/cms/pages")
  await expect(cms.getByLabel("Page path", { exact: true })).toBeEditable()
  const button = cms.getByRole("button", { name: `Delete ${key}`, exact: true })
  if (await button.count()) {
    await expect(button).toBeEnabled()
    await button.click()
    await expect(cms.getByRole("link", { name: key, exact: true })).toBeHidden()
  }
}

async function seedArticle(cms: Page, key: string) {
  const badgeId = `shared:${key.replaceAll("_", "-")}-badge`
  const articleId = `shared:${key.replaceAll("_", "-")}-article`
  await deleteSources(cms, [badgeId, articleId])
  const badge = await publishSource(cms, badgeId, {
    root: { props: { __sharedComponent: { name: `Badge ${key}`, exposures: {} } } },
    content: [{ type: "Text", props: { id: "badge", text: "Shared badge", className: "p-1" } }],
  })
  const article = await publishSource(cms, articleId, {
    root: {
      props: {
        __sharedComponent: {
          name: `Article ${key}`,
          exposures: {
            headline: { node: "headline", prop: "text", kind: "prop", label: "Headline" },
            headlineClasses: {
              node: "headline",
              prop: "className",
              kind: "prop",
              label: "Headline classes",
            },
            body: { node: "body", prop: "content", kind: "slot", label: "Body" },
          },
        },
      },
    },
    content: [
      {
        type: "Text",
        props: { id: "announcement", text: "Shared announcement", className: "p-11" },
      },
      { type: "Text", props: { id: "headline", text: "Default headline", className: "p-1" } },
      {
        type: "Container",
        props: {
          id: "body",
          content: [
            {
              type: "Container",
              props: {
                id: "owned-container",
                content: [
                  {
                    type: "Text",
                    props: { id: "body-text", text: "Default body", className: "p-1" },
                  },
                  {
                    type: "SharedComponent",
                    props: { id: "nested-badge", definitionId: badgeId },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  })
  return { badge, article }
}

async function publishPage(cms: Page, key: string) {
  await cms.getByRole("button", { name: "Publish", exact: true }).click()
  await expect(cms.getByText(`Successfully published ${key}`, { exact: true })).toBeVisible()
}

test.describe("Shared components", { tag: ["@cms", "@playground"] }, () => {
  test.setTimeout(120_000)
  test.beforeEach(async ({ cms }) => {
    cms.setDefaultTimeout(15_000)
  })

  test("authors a source with Exposed props, metadata history, search, and deletion", async ({
    cms,
    testKey,
    errorCapture,
  }) => {
    const name = `Announcement ${testKey}`
    const renamed = `Renamed ${name}`
    let id: string | null = null
    try {
      await cms.goto("/cms/library")
      await cms.getByRole("button", { name: "New Shared component", exact: true }).click()
      await cms.getByLabel("New Shared component name", { exact: true }).fill(name)
      await cms.getByRole("button", { name: "Create Shared component", exact: true }).click()
      await expect(cms.getByLabel("Shared component name", { exact: true })).toHaveValue(name)
      id = new URL(cms.url()).searchParams.get("source")
      if (!id) throw new Error("The new source has no identity")

      const preview = cms.frameLocator("iframe#preview-frame")
      await insertComponent(cms, "Container")
      const slot = preview.locator(
        '[data-puck-dropzone^="Container-"][data-puck-dropzone$=":content"]',
      )
      await expect(slot).toHaveCount(1)
      await insertComponent(cms, "Text", slot, true)
      await expect(slot.locator('[data-puck-component^="Text-"]')).toHaveCount(1)
      await cms.locator('textarea[name="text"]').fill("Author a reusable announcement")
      await cms.getByRole("switch", { name: "Expose text", exact: true }).click()
      const label = cms.getByLabel("Label for text", { exact: true })
      await label.fill("")
      await expect(label).toHaveValue("")
      await expect(cms.getByRole("button", { name: "Undo", exact: true })).toBeEnabled()
      await label.fill("Announcement")
      await cms.getByRole("button", { name: "Undo", exact: true }).click()
      await expect(label).toHaveValue("")
      await cms.getByRole("button", { name: "Redo", exact: true }).click()
      await expect(label).toHaveValue("Announcement")
      await cms.getByLabel("Shared component name", { exact: true }).fill(renamed)
      await cms.getByRole("button", { name: "Publish source", exact: true }).click()
      await expect(cms.getByText(`Published ${renamed}`, { exact: true })).toBeVisible()
      await cms.reload()
      await expect(cms.getByLabel("Shared component name", { exact: true })).toHaveValue(renamed)
      await expect(preview.getByText("Author a reusable announcement")).toBeVisible()

      await cms.getByRole("link", { name: "Back to library", exact: true }).click()
      await cms.setViewportSize({ width: 390, height: 844 })
      await cms.getByLabel("Search Shared components", { exact: true }).fill(renamed)
      await expect(cms.getByRole("link", { name: renamed, exact: true })).toBeVisible()
      await expect(cms.getByText("1 Exposed prop", { exact: true })).toBeVisible()
      await expect
        .poll(() =>
          cms.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        )
        .toBe(0)
      await cms.getByRole("button", { name: `Delete ${renamed}`, exact: true }).click()
      await cms.getByRole("button", { name: "Delete source", exact: true }).click()
      await expect(
        cms.getByRole("dialog").filter({
          has: cms.getByRole("button", { name: "Delete source", exact: true }),
        }),
      ).toBeHidden()
      await expect(cms.getByText("No matching Shared components", { exact: true })).toBeVisible()
      await cms.getByRole("button", { name: "Clear search", exact: true }).click()
      expect(errorCapture.browserErrors).toEqual([])
    } finally {
      if (id) await deleteSources(cms, [id])
    }
  })

  test("preserves native instance ownership, drafts, shared updates, and rendering parity", async ({
    cms,
    cmsSeededPageKey,
    page,
    testKey,
    errorCapture,
  }) => {
    const { article, badge } = await seedArticle(cms, testKey)
    const preview = cms.frameLocator("iframe#preview-frame")
    try {
      await cms.goto(`/cms/edit${cmsSeededPageKey}`)
      const alias = `SharedPalette_${encodeURIComponent(article.id)}`
      await cms.getByRole("tab", { name: "Components", exact: true }).click()
      await expect(cms.getByTestId(`drawer-item:${alias}`)).toContainText(`Article ${testKey}`)
      await insertComponent(cms, alias)
      await preview.getByText("Default headline", { exact: true }).click()
      await expect(
        cms.getByRole("heading", { name: `Article ${testKey}`, exact: true, level: 3 }),
      ).toBeVisible()
      await cms.locator('textarea[name="headline"]').fill("First headline")
      await cms.locator('input[name="headlineClasses"]').fill("p-17")
      await preview.getByText("Default body", { exact: true }).click()
      await cms.locator('textarea[name="text"]').fill("First body")
      await insertComponent(cms, alias)
      await preview.getByText("Default headline", { exact: true }).click()
      await cms.locator('textarea[name="headline"]').fill("Second headline")
      await preview.getByText("Default body", { exact: true }).click()
      await cms.locator('textarea[name="text"]').fill("Second body")
      await expect(preview.getByText("Shared badge", { exact: true })).toHaveCount(2)
      await expect(
        preview.getByTestId("dropzone:root:default-zone").locator(":scope > [data-puck-component]"),
      ).toHaveCount(2)

      await preview.getByText("First headline", { exact: true }).click()
      await expect(cms.getByRole("button", { name: "Undo", exact: true })).toBeEnabled()
      await preview.getByRole("button", { name: "Duplicate", exact: true }).click()
      await expect(preview.getByText("First body", { exact: true })).toHaveCount(2)
      await cms.getByRole("button", { name: "Undo", exact: true }).click()
      await expect(preview.getByText("First body", { exact: true })).toHaveCount(1)
      await cms.getByRole("button", { name: "Redo", exact: true }).click()
      await expect(preview.getByText("First body", { exact: true })).toHaveCount(2)
      await preview.getByText("First body", { exact: true }).last().click()
      await cms.locator('textarea[name="text"]').fill("Duplicated body")
      await expect(preview.getByText("First body", { exact: true })).toHaveCount(1)
      await preview.getByText("First headline", { exact: true }).last().click()
      await expect(cms.getByRole("button", { name: "Undo", exact: true })).toBeEnabled()
      await preview.getByRole("button", { name: "Delete", exact: true }).click()
      await expect(preview.getByText("Duplicated body", { exact: true })).toHaveCount(0)
      await cms.getByRole("button", { name: "Undo", exact: true }).click()
      await expect(preview.getByText("Duplicated body", { exact: true })).toHaveCount(1)
      await cms.getByRole("button", { name: "Redo", exact: true }).click()
      await expect(preview.getByText("Duplicated body", { exact: true })).toHaveCount(0)

      const bodies = preview.getByTestId(/dropzone:.*:body$/)
      await preview.getByText("First body", { exact: true }).click()
      await expect(cms.locator('textarea[name="text"]')).toHaveValue("First body")
      await moveComponent(cms, "Text", bodies.nth(1))
      await expect(bodies.nth(1).getByText("First body", { exact: true })).toHaveCount(1)
      await expect(bodies.nth(0).getByText("First body", { exact: true })).toHaveCount(0)
      await cms.getByRole("button", { name: "Undo", exact: true }).click()
      await expect(bodies.nth(0).getByText("First body", { exact: true })).toHaveCount(1)
      await expect(bodies.nth(1).getByText("First body", { exact: true })).toHaveCount(0)
      await cms.getByRole("button", { name: "Redo", exact: true }).click()
      await expect(bodies.nth(1).getByText("First body", { exact: true })).toHaveCount(1)
      await expect(bodies.nth(0).getByText("First body", { exact: true })).toHaveCount(0)

      const body = bodies.first()
      await insertComponent(cms, "Text", body)
      await cms.locator('textarea[name="text"]').fill("New instance-owned child")
      await publishPage(cms, cmsSeededPageKey)
      await cms.reload()
      for (const text of [
        "First headline",
        "Second headline",
        "First body",
        "Second body",
        "New instance-owned child",
      ]) {
        await expect(preview.getByText(text, { exact: true })).toHaveCount(1)
      }

      await preview.getByText("First headline", { exact: true }).click()
      await cms.locator('textarea[name="headline"]').fill("Draft first headline")
      await cms.getByRole("link", { name: "Edit Shared source", exact: true }).click()
      await preview.getByText("Shared announcement", { exact: true }).click()
      await cms.locator('textarea[name="text"]').fill("Updated shared announcement")
      await cms.locator('input[name="className"]').fill("p-13")
      await preview.getByText("Default headline", { exact: true }).click()
      await cms.locator('textarea[name="text"]').fill("Later default headline")
      await preview.getByText("Default body", { exact: true }).click()
      await cms.locator('textarea[name="text"]').fill("Later default body")
      await cms.getByRole("button", { name: "Publish source", exact: true }).click()
      await expect(cms.getByText(`Published Article ${testKey}`, { exact: true })).toBeVisible()
      await cms.getByRole("link", { name: "Back to Page", exact: true }).click()
      await expect(preview.getByText("Draft first headline", { exact: true })).toBeVisible()
      await expect(preview.getByText("Updated shared announcement", { exact: true })).toHaveCount(2)
      await expect(preview.getByText("Later default body", { exact: true })).toHaveCount(0)

      const updatedBadge = structuredClone(badge.data)
      updatedBadge.content = [
        { type: "Text", props: { id: "badge", text: "Updated shared badge", className: "p-1" } },
      ]
      await publishSource(cms, badge.id, updatedBadge, badge.updatedAt)
      await cms.reload()
      await expect(preview.getByText("Updated shared badge", { exact: true })).toHaveCount(2)
      await expect(preview.getByText("First body", { exact: true })).toHaveCount(1)
      await expect(preview.getByText("Second body", { exact: true })).toHaveCount(1)

      await insertComponent(cms, alias)
      await expect(preview.getByText("Later default headline", { exact: true })).toHaveCount(1)
      await expect(preview.getByText("Later default body", { exact: true })).toHaveCount(1)
      await cms.goto(`/cms/preview${cmsSeededPageKey}`)
      await expect(cms.getByText("Draft first headline", { exact: true })).toBeVisible()
      await expect(cms.getByText("Updated shared badge", { exact: true })).toHaveCount(3)

      expect((await page.goto(cmsSeededPageKey))?.status()).toBe(200)
      await expect(page.getByText("First headline", { exact: true })).toBeVisible()
      await expect(page.getByText("First headline", { exact: true })).toHaveCSS("padding", "68px")
      await expect(page.getByText("Draft first headline", { exact: true })).toHaveCount(0)
      await expect(page.getByText("Updated shared announcement", { exact: true })).toHaveCount(2)
      await expect(
        page.getByText("Updated shared announcement", { exact: true }).first(),
      ).toHaveCSS("padding", "52px")
      await expect(page.getByText("Updated shared badge", { exact: true })).toHaveCount(2)
      for (const text of ["First body", "Second body", "New instance-owned child"]) {
        await expect(page.getByText(text, { exact: true })).toHaveCount(1)
      }
      expect(errorCapture.browserErrors).toEqual([])
    } finally {
      await deleteConsumer(cms, cmsSeededPageKey)
      await deleteSources(cms, [badge.id, article.id])
    }
  })

  test("drops a component into an empty per-instance slot on a Page", async ({
    cms,
    cmsSeededPageKey,
    testKey,
  }) => {
    const id = `shared:${testKey.replaceAll("_", "-")}-frame`
    await deleteSources(cms, [id])
    await publishSource(cms, id, {
      root: {
        props: {
          __sharedComponent: {
            name: `Frame ${testKey}`,
            exposures: { body: { node: "body", prop: "content", kind: "slot", label: "Body" } },
          },
        },
      },
      content: [{ type: "Container", props: { id: "body", content: [] } }],
    })
    const preview = cms.frameLocator("iframe#preview-frame")
    try {
      await cms.goto(`/cms/edit${cmsSeededPageKey}`)
      await insertComponent(cms, `SharedPalette_${encodeURIComponent(id)}`)
      const body = preview.getByTestId(/dropzone:.*:body$/)
      await expect(body).toHaveCount(1)
      await expect(body.locator("[data-puck-component]")).toHaveCount(0)
      await insertComponent(cms, "Text", body, true)
      await expect(body.locator('[data-puck-component^="Text-"]')).toHaveCount(1)
    } finally {
      await deleteConsumer(cms, cmsSeededPageKey)
      await deleteSources(cms, [id])
    }
  })

  test("shows referenced-deletion and stale-publication errors without losing a source", async ({
    cms,
    cmsSeededPageKey,
    testKey,
  }) => {
    const { article, badge } = await seedArticle(cms, testKey)
    try {
      await cms.goto(`/cms/edit${cmsSeededPageKey}`)
      await insertComponent(cms, `SharedPalette_${encodeURIComponent(article.id)}`)
      await publishPage(cms, cmsSeededPageKey)
      await cms.goto("/cms/library")
      await cms.getByRole("button", { name: `Delete Article ${testKey}`, exact: true }).click()
      await cms.getByRole("button", { name: "Delete source", exact: true }).click()
      await expect(cms.getByRole("dialog").getByRole("alert")).toContainText(cmsSeededPageKey)
      await cms.getByRole("button", { name: "Cancel", exact: true }).click()
      await cms.getByRole("link", { name: `Article ${testKey}`, exact: true }).click()
      await expect(cms.getByRole("button", { name: "Publish source", exact: true })).toBeEnabled()

      const changed = structuredClone(article.data)
      const announcement = changed.content.find((node) => node.props.id === "announcement")
      if (!announcement) throw new Error("Missing source announcement")
      announcement.props.text = "A newer publication"
      const newer = await publishSource(cms, article.id, changed, article.updatedAt)
      await cms.getByRole("button", { name: "Publish source", exact: true }).click()
      await expect(cms.getByRole("alert").filter({ hasText: "Reload" })).toBeVisible()
      await cms.getByRole("button", { name: "Reload source", exact: true }).click()
      await expect(
        cms.frameLocator("iframe#preview-frame").getByText("A newer publication", { exact: true }),
      ).toBeVisible()

      await cms
        .frameLocator("iframe#preview-frame")
        .getByText("A newer publication", { exact: true })
        .click()
      await cms.locator('textarea[name="text"]').fill("Discard this local source draft")
      await publishSource(cms, article.id, newer.data, newer.updatedAt)
      await cms.getByRole("button", { name: "Publish source", exact: true }).click()
      await cms.getByRole("button", { name: "Reload source", exact: true }).click()
      await expect(
        cms.frameLocator("iframe#preview-frame").getByText("A newer publication", { exact: true }),
      ).toBeVisible()
      await expect(
        cms.frameLocator("iframe#preview-frame").getByText("Discard this local source draft"),
      ).toHaveCount(0)
    } finally {
      await deleteConsumer(cms, cmsSeededPageKey)
      await deleteSources(cms, [badge.id, article.id])
    }
  })
})
