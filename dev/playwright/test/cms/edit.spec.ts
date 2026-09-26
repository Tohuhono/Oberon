import { expect, test } from "@dev/playwright/helpers/fixtures"
import type { Locator, Page } from "@playwright/test"

async function waitForEditorPreview(cms: Page) {
  await expect(cms.getByRole("group", { name: "Viewport size", exact: true })).toBeVisible()
  await expect(cms.getByRole("button", { name: "Preview mode", exact: true })).toBeVisible()
  await expect(cms.locator("iframe#preview-frame")).toBeVisible()
}

async function openMenuWithItem(button: Locator, item: Locator) {
  await expect(button).toBeVisible()
  await expect(button).toBeEnabled()

  for (let attempt = 0; attempt < 3; attempt++) {
    await button.click()

    try {
      await expect(item).toBeVisible({ timeout: 2_000 })
      return
    } catch (error) {
      if (attempt === 2) {
        throw error
      }
    }
  }
}

async function selectMenuItem(button: Locator, item: Locator) {
  await openMenuWithItem(button, item)
  await item.click()
  await expect(item).toBeHidden()
}

test.describe("CMS Edit Actions", { tag: "@cms" }, () => {
  test("publishes from editor", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await waitForEditorPreview(cms)

    const publishButton = cms.getByRole("button", {
      name: "Publish",
      exact: true,
    })

    await expect(publishButton).toBeEnabled()
    await publishButton.click()
    await expect(
      cms.getByText(`Successfully published ${cmsSeededPageKey}`, {
        exact: true,
      }),
    ).toBeVisible()

    await cms.goto(cmsSeededPageKey)
    await expect(cms).toHaveURL(cmsSeededPageKey)
  })

  test("shows modern header actions without legacy sidebar toggle", async ({
    cms,
    cmsSeededPageKey,
  }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    await expect(cms.getByRole("button", { name: "Preview", exact: true })).toBeVisible()
    await expect(cms.getByRole("button", { name: "View", exact: true })).toBeVisible()
    await expect(cms.getByRole("button", { name: "Publish", exact: true })).toBeVisible()
  })

  test("provides viewport controls for the preview", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    const viewportControls = cms.getByRole("group", {
      name: "Viewport size",
      exact: true,
    })

    await expect(viewportControls).toBeVisible()

    const frame = cms.locator("iframe#preview-frame")
    await expect(frame).toBeVisible()
    let fullWidth = 0
    await expect
      .poll(async () => {
        fullWidth = (await frame.boundingBox())?.width ?? 0
        return fullWidth
      })
      .toBeGreaterThan(0)

    await viewportControls.getByRole("button", { name: "Small", exact: true }).click()

    await expect.poll(async () => (await frame.boundingBox())?.width ?? 0).toBeLessThan(fullWidth)
  })

  test(
    "publishes a text component with a className",
    { tag: "@playground" },
    async ({ cms, cmsSeededPageKey, errorCapture }) => {
      await cms.goto(`/cms/edit${cmsSeededPageKey}`)
      await waitForEditorPreview(cms)

      await cms.getByRole("tab", { name: "Components", exact: true }).click()

      const previewFrame = cms.frameLocator("iframe#preview-frame")
      const rootDropZone = previewFrame.getByTestId("dropzone:root:default-zone")
      await expect(rootDropZone).toBeVisible()

      const drawerItemBox = await cms.getByTestId("drawer-item:Text").boundingBox()
      const rootDropZoneBox = await rootDropZone.boundingBox()

      if (!drawerItemBox || !rootDropZoneBox) {
        throw new Error("Text drawer item and root drop zone must have bounding boxes")
      }

      await cms.mouse.move(
        drawerItemBox.x + drawerItemBox.width / 2,
        drawerItemBox.y + drawerItemBox.height / 2,
      )
      await cms.mouse.down()
      await cms.waitForTimeout(250)
      await cms.mouse.move(
        drawerItemBox.x + drawerItemBox.width / 2 + 10,
        drawerItemBox.y + drawerItemBox.height / 2,
        { steps: 5 },
      )
      await cms.mouse.move(
        rootDropZoneBox.x + rootDropZoneBox.width / 2,
        rootDropZoneBox.y + rootDropZoneBox.height / 2,
        { steps: 20 },
      )
      await cms.mouse.up()

      const pageSettingsTab = cms.getByRole("tab", { name: "Page Settings", exact: true })
      await expect(pageSettingsTab).toHaveAttribute("aria-selected", "true")

      const inspectorPanel = cms.getByRole("tabpanel")
      const textInput = inspectorPanel.locator('textarea[name="text"]')
      await expect(textInput).toBeVisible()
      await textInput.fill("Welcome to OberonCMS")

      const classNameInput = inspectorPanel.locator('input[name="className"]')
      await expect(classNameInput).toBeVisible()
      await classNameInput.fill("p-1")

      const publishButton = cms.getByRole("button", {
        name: "Publish",
        exact: true,
      })

      await publishButton.click()
      await expect(
        cms.getByText(`Successfully published ${cmsSeededPageKey}`, {
          exact: true,
        }),
      ).toBeVisible()

      errorCapture.clear()
      await cms.goto(cmsSeededPageKey)
      await expect(cms).toHaveURL(cmsSeededPageKey)
      const publishedText = cms.locator(".p-1", { hasText: "Welcome to OberonCMS" }).first()
      await expect(publishedText).toBeVisible()
      await expect(publishedText).toHaveCSS("padding", "4px")
      expect(errorCapture.browserErrors).toEqual([])
    },
  )
})

test.describe("CMS Edit Theme Modes", { tag: "@tdd" }, () => {
  test("applies preview follow mode when editor mode changes", async ({
    cms,
    cmsSeededPageKey,
  }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await waitForEditorPreview(cms)

    const frameHtml = cms.frameLocator("iframe#preview-frame").locator("html")
    const previewModeButton = cms.getByRole("button", {
      name: "Preview mode",
      exact: true,
    })
    const previewModeMenu = cms.getByRole("menu").filter({
      has: cms.getByRole("menuitem", { name: "Follow", exact: true }),
    })
    const editorThemeToggle = cms.getByRole("button", {
      name: "Toggle theme",
      exact: true,
    })
    const editorThemeMenu = cms.getByRole("menu").filter({
      has: cms.getByRole("menuitem", { name: "System", exact: true }),
    })
    const previewFollowItem = previewModeMenu.getByRole("menuitem", {
      name: "Follow",
      exact: true,
    })
    const editorLightItem = editorThemeMenu.getByRole("menuitem", {
      name: "Light",
      exact: true,
    })
    const editorDarkItem = editorThemeMenu.getByRole("menuitem", {
      name: "Dark",
      exact: true,
    })

    await selectMenuItem(previewModeButton, previewFollowItem)

    await selectMenuItem(editorThemeToggle, editorLightItem)
    await expect(frameHtml).not.toHaveClass(/dark/)

    await selectMenuItem(editorThemeToggle, editorDarkItem)
    await expect(frameHtml).toHaveClass(/dark/)
  })

  test("applies explicit preview light and dark modes", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await waitForEditorPreview(cms)

    const frameHtml = cms.frameLocator("iframe#preview-frame").locator("html")
    const previewModeButton = cms.getByRole("button", {
      name: "Preview mode",
      exact: true,
    })
    const previewModeMenu = cms.getByRole("menu").filter({
      has: cms.getByRole("menuitem", { name: "Follow", exact: true }),
    })
    const previewLightItem = previewModeMenu.getByRole("menuitem", {
      name: "Light",
      exact: true,
    })
    const previewDarkItem = previewModeMenu.getByRole("menuitem", {
      name: "Dark",
      exact: true,
    })

    await selectMenuItem(previewModeButton, previewDarkItem)
    await expect(frameHtml).toHaveClass(/dark/)

    await selectMenuItem(previewModeButton, previewLightItem)
    await expect(frameHtml).not.toHaveClass(/dark/)

    await selectMenuItem(previewModeButton, previewDarkItem)
    await expect(frameHtml).toHaveClass(/dark/)
  })

  test("hides preview mode controls outside editor pages", async ({ cms }) => {
    await cms.goto("/cms/pages")

    await expect(cms.getByRole("button", { name: "Preview mode", exact: true })).toHaveCount(0)
  })

  test("resets preview mode to follow on editor remount", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await waitForEditorPreview(cms)

    const frameHtml = cms.frameLocator("iframe#preview-frame").locator("html")
    const previewModeButton = cms.getByRole("button", {
      name: "Preview mode",
      exact: true,
    })
    const previewModeMenu = cms.getByRole("menu").filter({
      has: cms.getByRole("menuitem", { name: "Follow", exact: true }),
    })
    const previewLightItem = previewModeMenu.getByRole("menuitem", {
      name: "Light",
      exact: true,
    })
    const previewDarkItem = previewModeMenu.getByRole("menuitem", {
      name: "Dark",
      exact: true,
    })

    await selectMenuItem(previewModeButton, previewDarkItem)
    await expect(frameHtml).toHaveClass(/dark/)

    await cms.goto("/cms/pages")
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await waitForEditorPreview(cms)

    await selectMenuItem(previewModeButton, previewLightItem)

    await expect(frameHtml).not.toHaveClass(/dark/)
  })
})
