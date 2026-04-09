import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Edit Actions", { tag: "@cms" }, () => {
  test("publishes from editor", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)
    await cms.getByRole("button", { name: "Publish" }).click()

    await cms.goto(cmsSeededPageKey)
    await expect(cms).toHaveURL(cmsSeededPageKey)
  })

  test(
    "publishes a text component with a className",
    { tag: "@playground" },
    async ({ cms, cmsSeededPageKey, errorCapture }) => {
      await cms.goto(`/cms/edit${cmsSeededPageKey}`)
      await cms.getByRole("tab", { name: "Insert", exact: true }).click()
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

      await insertTextButton.hover()
      await cms.mouse.down()
      await previewDropzone.hover()
      await previewDropzone.hover()
      await cms.mouse.up()

      await cms.getByRole("tab", { name: "Inspector", exact: true }).click()
      const inspectorPanel = cms.getByRole("tabpanel")
      const classNameInput = inspectorPanel
        .locator('input[name="className"]')
        .first()
      const textInput = inspectorPanel.locator('textarea[name="text"]').first()
      await expect(textInput).toBeVisible()
      await textInput.fill("Welcome to OberonCMS")
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
