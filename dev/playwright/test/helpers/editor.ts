import { expect, type Locator, type Page } from "@playwright/test"

async function dragComponent(
  page: Page,
  from: Locator,
  to: Locator,
  dragged?: Locator,
  waitForDropTarget = false,
  dropAtEnd = false,
) {
  await expect(from).toBeVisible()
  await expect(to).toBeVisible()
  await from.scrollIntoViewIfNeeded()
  const sourceBox = await from.boundingBox()
  const previousAnnouncements =
    dragged || waitForDropTarget ? await page.getByRole("status").allTextContents() : []

  if (!sourceBox) {
    throw new Error("The drag source must have a bounding box")
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
  await page.mouse.down()
  try {
    await page.waitForTimeout(250)
    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2 + 10,
      sourceBox.y + sourceBox.height / 2,
      { steps: 5 },
    )
    if (dragged) {
      await expect(dragged).toBeVisible()
    }
    await to.scrollIntoViewIfNeeded()
    const targetBox = await to.boundingBox()
    if (!targetBox) throw new Error("The drop target must have a bounding box")
    // The center of a zone can be inside a nested slot, so append to the end of the zone instead
    const targetY = dropAtEnd
      ? targetBox.y + targetBox.height - 4
      : targetBox.y + targetBox.height / 2
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetY, { steps: 20 })
    if (dragged || waitForDropTarget) {
      const targetIds = await to.evaluate((target, exactZone) => {
        const zoneId = target.getAttribute("data-puck-dropzone")
        if (exactZone && zoneId) return [zoneId]
        return [
          target,
          ...target.querySelectorAll("[data-puck-component], [data-puck-dropzone]"),
        ].flatMap((node) =>
          [
            node.getAttribute("data-puck-component"),
            node.getAttribute("data-puck-dropzone"),
          ].filter((id) => id !== null),
        )
      }, waitForDropTarget)
      await expect
        .poll(async () => {
          const announcements = await page.getByRole("status").allTextContents()
          return targetIds.some((id) =>
            announcements.some(
              (message) =>
                ((!dragged && !waitForDropTarget) || !previousAnnouncements.includes(message)) &&
                message.endsWith(`droppable target ${id}.`),
            ),
          )
        })
        .toBe(true)
      if (waitForDropTarget) await page.waitForTimeout(500)
    }
  } finally {
    await page.mouse.up()
  }
}

export async function insertComponent(
  page: Page,
  type: string,
  dropZone?: Locator,
  waitForDropTarget = false,
) {
  await expect(page.locator("iframe#preview-frame")).toBeVisible()
  await page.getByRole("tab", { name: "Components", exact: true }).click()
  await dragComponent(
    page,
    page.getByTestId(`drawer-item:${type}`),
    dropZone ?? page.frameLocator("iframe#preview-frame").getByTestId("dropzone:root:default-zone"),
    undefined,
    waitForDropTarget,
    !dropZone,
  )
  await expect(page.getByRole("tab", { name: "Page Settings", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
}

export async function moveComponent(page: Page, label: string, dropZone: Locator) {
  const preview = page.frameLocator("iframe#preview-frame")
  await dragComponent(
    page,
    preview
      .locator("[data-puck-overlay]")
      .filter({ has: preview.getByText(label, { exact: true }) })
      .getByRole("button", { name: "Drag to reorder", exact: true }),
    dropZone,
    preview.locator("[data-dnd-dragging]"),
  )
}

export async function insertTextComponent(page: Page) {
  await insertComponent(page, "Text")
  await expect(page.locator('textarea[name="text"]')).toBeVisible()
}
