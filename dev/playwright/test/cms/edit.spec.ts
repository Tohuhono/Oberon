import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Edit Actions", { tag: "@cms" }, () => {
  test("publishes from editor", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
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
      const previewFrame = cms.frameLocator("iframe#preview-frame")
      const textComponent = previewFrame.getByText("Welcome to OberonCMS").first()

      const frame = cms.locator("iframe#preview-frame")
      await expect.poll(async () => (await frame.boundingBox())?.width ?? 0).toBeGreaterThan(0)
      await expect(textComponent).toBeVisible()
      await textComponent.click()

      const textHeading = cms.getByRole("heading", { name: "Text" })
      const inspectorPanel = cms.getByRole("tabpanel")
      await expect(inspectorPanel).toBeVisible()

      await expect(textHeading).toBeVisible()

      const textInput = inspectorPanel.locator('textarea[name="text"]').first()
      await expect(textInput).toBeVisible()
      await textInput.fill("Welcome to OberonCMS")

      const classNameInput = inspectorPanel.locator('input[name="className"]').first()
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
      await expect(cms.getByText("Welcome to OberonCMS").first()).toBeVisible()
      await expect(cms.locator(".p-1", { hasText: "Welcome to OberonCMS" }).first()).toBeVisible()
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

    await previewModeButton.click()
    await expect(previewModeMenu).toBeVisible()
    await previewModeMenu.getByRole("menuitem", { name: "Follow", exact: true }).click()

    await editorThemeToggle.click()
    await editorThemeMenu.getByRole("menuitem", { name: "Light", exact: true }).click()
    await expect(frameHtml).not.toHaveClass(/dark/)

    await editorThemeToggle.click()
    await editorThemeMenu.getByRole("menuitem", { name: "Dark", exact: true }).click()
    await expect(frameHtml).toHaveClass(/dark/)
  })

  test("applies explicit preview light and dark modes", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    const frameHtml = cms.frameLocator("iframe#preview-frame").locator("html")
    const previewModeButton = cms.getByRole("button", {
      name: "Preview mode",
      exact: true,
    })
    const previewModeMenu = cms.getByRole("menu").filter({
      has: cms.getByRole("menuitem", { name: "Follow", exact: true }),
    })

    const openPreviewModeMenu = async () => {
      await previewModeButton.click()
    }

    const openThemeMenu = async () => {
      await previewModeButton.click()
    }

    await openThemeMenu()
    await previewModeMenu.getByRole("menuitem", { name: "Dark", exact: true }).click()
    await expect(frameHtml).toHaveClass(/dark/)

    await openPreviewModeMenu()
    await cms.getByRole("menuitem", { name: "Light", exact: true }).click()
    await expect(frameHtml).not.toHaveClass(/dark/)

    await openPreviewModeMenu()
    await cms.getByRole("menuitem", { name: "Dark", exact: true }).click()
    await expect(frameHtml).toHaveClass(/dark/)
  })

  test("hides preview mode controls outside editor pages", async ({ cms }) => {
    await cms.goto("/cms/pages")

    await expect(cms.getByRole("button", { name: "Preview mode", exact: true })).toHaveCount(0)
  })

  test("resets preview mode to follow on editor remount", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    const frameHtml = cms.frameLocator("iframe#preview-frame").locator("html")
    const previewModeButton = cms.getByRole("button", {
      name: "Preview mode",
      exact: true,
    })
    const previewModeMenu = cms.getByRole("menu").filter({
      has: cms.getByRole("menuitem", { name: "Follow", exact: true }),
    })

    const openPreviewModeMenu = async () => {
      await previewModeButton.click()
    }

    const openThemeMenu = async () => {
      await previewModeButton.click()
    }

    await openPreviewModeMenu()
    await cms.getByRole("menuitem", { name: "Dark", exact: true }).click()
    await expect(frameHtml).toHaveClass(/dark/)

    await cms.goto("/cms/pages")
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    await openThemeMenu()
    await previewModeMenu.getByRole("menuitem", { name: "Light", exact: true }).click()

    await expect(frameHtml).not.toHaveClass(/dark/)
  })
})
