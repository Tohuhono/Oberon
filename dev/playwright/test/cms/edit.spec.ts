import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Edit Actions", { tag: "@cms" }, () => {
  test("publishes from editor", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await cms.getByRole("button", { name: "Publish" }).click()

    await cms.goto(cmsSeededPageKey)
    await expect(cms).toHaveURL(cmsSeededPageKey)
  })

  test("shows modern header actions without legacy sidebar toggle", async ({
    cms,
    cmsSeededPageKey,
  }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    await expect(
      cms.getByRole("button", { name: "Preview", exact: true }),
    ).toBeVisible()
    await expect(
      cms.getByRole("button", { name: "View", exact: true }),
    ).toBeVisible()
    await expect(
      cms.getByRole("button", { name: "Publish", exact: true }),
    ).toBeVisible()
  })

  test("provides viewport controls for the preview", async ({
    cms,
    cmsSeededPageKey,
  }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    const viewportControls = cms.getByRole("group", {
      name: "Viewport size",
      exact: true,
    })

    await expect(viewportControls).toBeVisible()

    const frame = cms.locator("iframe#preview-frame")
    await expect(frame).toBeVisible()
    const fullWidth = (await frame.boundingBox())?.width ?? 0

    await viewportControls
      .getByRole("button", { name: "Small", exact: true })
      .click()

    await expect
      .poll(async () => (await frame.boundingBox())?.width ?? 0)
      .toBeLessThan(fullWidth)
  })

  test(
    "publishes a text component with a className",
    { tag: "@playground" },
    async ({ cms, cmsSeededPageKey, errorCapture }) => {
      await cms.goto(`/cms/edit${cmsSeededPageKey}`)
      await cms.getByRole("tab", { name: "Components", exact: true }).click()
      const insertPanel = cms.getByRole("tabpanel")
      const insertTextButton = insertPanel
        .getByRole("button", { name: "Text", exact: true })
        .first()

      const previewFrame = cms.frameLocator("iframe#preview-frame")
      const previewDropzone = previewFrame
        .locator("[data-puck-dropzone]")
        .first()

      await expect(insertTextButton).toBeVisible()
      await expect(previewDropzone).toBeVisible()

      const box = await previewDropzone.boundingBox()
      if (!box) throw new Error("Dropzone not visible")

      await insertTextButton.hover()
      await cms.mouse.down()

      await cms.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 20,
      })
      await cms.mouse.up()

      const inspectorPanel = cms.getByRole("tabpanel")
      await expect(inspectorPanel).toBeVisible()

      await expect(cms.getByRole("heading", { name: "Text" })).toBeVisible()

      const textInput = inspectorPanel.locator('textarea[name="text"]').first()
      await expect(textInput).toBeVisible()
      await textInput.fill("Welcome to OberonCMS")

      const classNameInput = inspectorPanel
        .locator('input[name="className"]')
        .first()
      await expect(classNameInput).toBeVisible()
      await classNameInput.fill("p-1")

      await cms.getByRole("button", { name: "Publish" }).click()

      errorCapture.clear()
      await cms.goto(cmsSeededPageKey)
      await expect(cms).toHaveURL(cmsSeededPageKey)
      await expect(cms.getByText("Welcome to OberonCMS")).toBeVisible()
      await expect(
        cms.locator(".p-1", { hasText: "Welcome to OberonCMS" }),
      ).toBeVisible()
      expect(errorCapture.browserErrors).toEqual([])
    },
  )
})
