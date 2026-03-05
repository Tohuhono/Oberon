import { expect, test } from "@playwright/test"

const prefix = "e2e-cms-user"

test.describe("CMS Users Actions", { tag: "@cms" }, () => {
  test("adds user", async ({ page }) => {
    const email = `${prefix}-${Date.now()}@example.com`

    await page.goto("/cms/users")

    await page.getByLabel("User email").fill(email)
    await page.getByRole("button", { name: "Add User" }).click()

    await expect(page.getByText(email)).toBeVisible()
  })

  test("changes role", async ({ page }) => {
    const email = `${prefix}-role-${Date.now()}@example.com`

    await page.goto("/cms/users")

    await page.getByLabel("User email").fill(email)
    await page.getByRole("button", { name: "Add User" }).click()

    const roleTrigger = page.getByRole("combobox", {
      name: `Role ${email}`,
    })
    await expect(roleTrigger).toBeEnabled()

    await roleTrigger.click()
    await page.getByRole("option", { name: "admin" }).click()

    await expect(roleTrigger).toContainText("admin")
  })

  test("deletes user", async ({ page }) => {
    const email = `${prefix}-delete-${Date.now()}@example.com`

    await page.goto("/cms/users")

    await page.getByLabel("User email").fill(email)
    await page.getByRole("button", { name: "Add User" }).click()

    const deleteButton = page.getByRole("button", {
      name: `Delete ${email}`,
    })
    await expect(deleteButton).toBeEnabled()
    await deleteButton.click()

    await expect(page.getByText(email)).toHaveCount(0)
  })
})
