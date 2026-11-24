import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Shared components", { tag: "@cms" }, () => {
  test("creates, publishes and deletes a Shared component", async ({ cms, testKey }) => {
    const name = `Shared ${testKey} ${Date.now()}`
    await cms.goto("/cms/library")
    await cms.getByRole("button", { name: "+ New Shared component", exact: true }).click()
    await expect(cms.getByRole("button", { name: "Create Shared component" })).toBeDisabled()
    await cms.getByLabel("Shared component name", { exact: true }).fill(name)
    await cms.getByRole("button", { name: "Create Shared component", exact: true }).click()

    try {
      await expect(cms).toHaveURL(/\/cms\/library\?source=/u)
      const sourceId = new URL(cms.url()).searchParams.get("source")
      if (!sourceId) {
        throw new Error("Creating a Shared component must open its source editor")
      }

      await expect(cms.getByText("Shared component source", { exact: true })).toBeVisible()
      await expect(cms.getByLabel("Shared component name", { exact: true })).toHaveValue(name)
      await cms.getByRole("button", { name: "Publish source", exact: true }).click()
      await expect(
        cms.getByText(`Successfully published shared ${sourceId}`, { exact: true }),
      ).toBeVisible()
      await cms.getByRole("button", { name: "Back to library", exact: true }).click()

      const card = cms.locator("article").filter({
        has: cms.getByRole("heading", { name, exact: true }),
      })
      await expect(card).toBeVisible()
      await expect(card.getByText("Fully shared", { exact: true })).toBeVisible()
      await card.getByRole("button", { name: "Delete", exact: true }).click()
      const deleteDialog = cms.getByRole("dialog")
      await deleteDialog.getByRole("button", { name: "Delete", exact: true }).click()
      await expect(card).toHaveCount(0)
    } finally {
      await cms.goto("/cms/library")
      const card = cms.locator("article").filter({
        has: cms.getByRole("heading", { name, exact: true }),
      })
      if (await card.count()) {
        await card.getByRole("button", { name: "Delete", exact: true }).click()
        await cms.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click()
        await expect(card).toHaveCount(0)
      }
    }
  })
})
