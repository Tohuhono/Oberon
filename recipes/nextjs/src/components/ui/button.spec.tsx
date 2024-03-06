import { test, expect } from "@playwright/experimental-ct-react"
import { Button } from "@/components/ui/button"

test.use({ viewport: { width: 500, height: 500 } })

test.describe("@component button", () => {
  test("event should work", async ({ mount }) => {
    let clicked = false

    // Mount a component. Returns locator pointing to the component.
    const component = await mount(
      <Button
        onClick={() => {
          clicked = true
        }}
      >
        Submit
      </Button>,
    )

    // As with any Playwright test, assert locator text.
    await expect(component).toContainText("Submit")

    // Perform locator click. This will trigger the event.
    await component.click()

    // Assert that respective events have been fired.
    expect(clicked).toBeTruthy()
  })
})
