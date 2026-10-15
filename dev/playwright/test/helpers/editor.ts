import { expect, type Page } from "@playwright/test"

export async function insertTextComponent(page: Page) {
  await expect(page.locator("iframe#preview-frame")).toBeVisible()
  await page.getByRole("tab", { name: "Components", exact: true }).click()

  const rootDropZone = page
    .frameLocator("iframe#preview-frame")
    .getByTestId("dropzone:root:default-zone")
  await expect(rootDropZone).toBeVisible()
  const drawerItemBox = await page.getByTestId("drawer-item:Text").boundingBox()
  const rootDropZoneBox = await rootDropZone.boundingBox()

  if (!drawerItemBox || !rootDropZoneBox) {
    throw new Error("Text drawer item and root drop zone must have bounding boxes")
  }

  await page.mouse.move(
    drawerItemBox.x + drawerItemBox.width / 2,
    drawerItemBox.y + drawerItemBox.height / 2,
  )
  await page.mouse.down()
  await page.waitForTimeout(250)
  await page.mouse.move(
    drawerItemBox.x + drawerItemBox.width / 2 + 10,
    drawerItemBox.y + drawerItemBox.height / 2,
    { steps: 5 },
  )
  await page.mouse.move(
    rootDropZoneBox.x + rootDropZoneBox.width / 2,
    rootDropZoneBox.y + rootDropZoneBox.height / 2,
    { steps: 20 },
  )
  await page.mouse.up()
  await expect(page.getByRole("tab", { name: "Page Settings", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await expect(page.locator('textarea[name="text"]')).toBeVisible()
}
