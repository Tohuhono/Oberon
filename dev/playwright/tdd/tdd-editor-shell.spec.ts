import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Editor Shell TDD @tdd @editor @issue-329", () => {
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

    await expect(
      cms.getByRole("button", { name: "<", exact: true }),
    ).toHaveCount(0)
    await expect(
      cms.getByRole("button", { name: ">", exact: true }),
    ).toHaveCount(0)
  })

  test("uses Insert, Outline, and Inspector tab labels", async ({
    cms,
    cmsSeededPageKey,
  }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    await expect(
      cms.getByRole("tab", { name: "Insert", exact: true }),
    ).toBeVisible()
    await expect(
      cms.getByRole("tab", { name: "Outline", exact: true }),
    ).toBeVisible()
    await expect(
      cms.getByRole("tab", { name: "Inspector", exact: true }),
    ).toBeVisible()

    const toolShell = cms
      .locator("aside")
      .filter({ has: cms.getByRole("tablist", { name: "Editor tools" }) })
    await expect(toolShell).toBeVisible()
  })

  test("provides viewport controls for the preview", async ({
    cms,
    cmsSeededPageKey,
  }) => {
    await cms.goto(`/cms/edit${cmsSeededPageKey}`)

    const viewportSelect = cms.getByLabel("Viewport size", { exact: true })

    await expect(viewportSelect).toBeVisible()

    const frame = cms.locator("iframe#preview-frame")
    await expect(frame).toBeVisible()
    const fullWidth = (await frame.boundingBox())?.width ?? 0

    await viewportSelect.selectOption("small")

    await expect
      .poll(async () => (await frame.boundingBox())?.width ?? 0)
      .toBeLessThan(fullWidth)
  })
})
