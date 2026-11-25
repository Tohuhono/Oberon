import { expect, type Locator, type Page } from "@playwright/test"

export async function insertComponent(page: Page, name: string, slot?: Locator) {
  await expect(page.locator("iframe#preview-frame")).toBeVisible()
  await page.getByRole("tab", { name: "Components", exact: true }).click()

  const dropZone =
    slot ?? page.frameLocator("iframe#preview-frame").getByTestId("dropzone:root:default-zone")
  const drawerItem = page.getByRole("tabpanel").getByRole("button", { name, exact: true })
  await dragComponent(page, drawerItem, dropZone, Boolean(slot))
}

export async function dragComponent(
  page: Page,
  draggable: Locator,
  dropZone: Locator,
  nested: boolean,
) {
  await expect(dropZone).toBeVisible()
  await expect(draggable).toBeVisible()
  if (nested) await dropZone.scrollIntoViewIfNeeded()
  await draggable.scrollIntoViewIfNeeded()
  const draggableBox = await draggable.boundingBox()
  const dropZoneBox = await dropZone.boundingBox()

  if (!draggableBox || !dropZoneBox) {
    throw new Error("The dragged component and its drop zone must have bounding boxes")
  }

  await page.mouse.move(
    draggableBox.x + draggableBox.width / 2,
    draggableBox.y + draggableBox.height / 2,
  )
  await page.mouse.down()
  await page.waitForTimeout(250)
  await page.mouse.move(
    draggableBox.x + draggableBox.width / 2 + 10,
    draggableBox.y + draggableBox.height / 2,
    { steps: 5 },
  )
  try {
    await page.mouse.move(
      dropZoneBox.x + dropZoneBox.width / 2,
      dropZoneBox.y + (nested ? dropZoneBox.height / 2 : dropZoneBox.height - 8),
      { steps: 20 },
    )
    if (nested) {
      const zone = (await dropZone.getAttribute("data-testid"))?.replace(/^dropzone:/u, "")
      await expect(
        page.getByRole("status").filter({ hasText: `droppable target ${zone}` }),
      ).toHaveCount(1)
      await page.waitForTimeout(500)
    }
  } finally {
    await page.mouse.up()
  }
}

export async function insertTextComponent(page: Page) {
  await insertComponent(page, "Text")
  await expect(page.getByRole("tab", { name: "Page Settings", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await expect(page.locator('textarea[name="text"]')).toBeVisible()
}
