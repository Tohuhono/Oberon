import { expect, type Locator, type Page } from "@playwright/test"

export async function insertComponent(page: Page, name: string, slot?: Locator) {
  await page.getByRole("tab", { name: "Components", exact: true }).click()

  const dropZone =
    slot ?? page.frameLocator("iframe#preview-frame").getByTestId("dropzone:root:default-zone")
  const drawerItem = page
    .getByRole("tabpanel")
    .getByRole("button", { name, exact: true })
    .and(page.getByTestId(/^drawer-item:/u))
  await dragComponent(page, drawerItem, dropZone, Boolean(slot))
}

export async function dragComponent(
  page: Page,
  draggable: Locator,
  dropZone: Locator,
  nested: boolean,
) {
  await expect(dropZone).toBeVisible()
  if (nested) await dropZone.scrollIntoViewIfNeeded()
  await draggable.scrollIntoViewIfNeeded()
  const draggableBox = await draggable.boundingBox()

  if (!draggableBox) {
    throw new Error("The dragged component must have a bounding box")
  }

  const start = {
    x: draggableBox.x + draggableBox.width / 2,
    y: draggableBox.y + draggableBox.height / 2,
  }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  try {
    await page.mouse.move(start.x + 10, start.y, { steps: 5 })
    await expect(
      page.getByRole("status").filter({
        hasText:
          /^(?:Picked up draggable item |Draggable item .* was moved over droppable target )/u,
      }),
    ).toBeAttached()
    const dropZoneBox = await dropZone.boundingBox()
    if (!dropZoneBox) {
      throw new Error("The drop zone must have a bounding box")
    }
    await page.mouse.move(
      dropZoneBox.x + dropZoneBox.width / 2,
      dropZoneBox.y + (nested ? dropZoneBox.height / 2 : dropZoneBox.height - 8),
      { steps: 20 },
    )
    // Puck renders a line at the pending insertion point before it commits the drop.
    await expect(dropZone.locator(":scope > [data-puck-line-placeholder]")).toBeVisible()
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
  await expect(page.getByRole("textbox", { name: "text", exact: true })).toBeEditable()
}
