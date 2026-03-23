import { expect, test as base } from "@dev/playwright/helpers/fixtures"
import { type Page } from "@playwright/test"

async function addUser(page: Page, email: string) {
  await page.goto("/cms/users")
  await page.getByLabel("User email").fill(email)
  await page.getByRole("button", { name: "Add User" }).click()
}

async function deleteUserByEmail(page: Page, email: string) {
  await page.goto("/cms/users")
  const deleteButton = page.getByRole("button", { name: `Delete ${email}` })
  const count = await deleteButton.count()

  if (count === 0) {
    return
  }

  await expect(deleteButton).toBeEnabled()
  await deleteButton.click()
  await expect(
    page.getByRole("button", { name: `Delete ${email}` }),
  ).toHaveCount(0)
}

const test = base.extend<{
  cmsSeededUserEmail: string
}>({
  cmsSeededUserEmail: async ({ cms, testKey }, use) => {
    const email = `e2e-${testKey}@tohuhono.com`
    await deleteUserByEmail(cms, email)
    await addUser(cms, email)
    await use(email)
    await deleteUserByEmail(cms, email)
  },
})

test.describe("CMS Users Actions", { tag: "@cms" }, () => {
  test("adds user", async ({ cms, cmsSeededUserEmail }) => {
    await expect(cms.getByText(cmsSeededUserEmail)).toBeVisible()
  })

  test("changes role", async ({ cms, cmsSeededUserEmail }) => {
    const roleTrigger = cms.getByRole("combobox", {
      name: `Role ${cmsSeededUserEmail}`,
    })
    await expect(roleTrigger).toBeEnabled()

    await roleTrigger.click()
    await cms.getByRole("option", { name: "admin" }).click()

    await expect(roleTrigger).toContainText("admin")
  })

  test("deletes user", async ({ cms, cmsSeededUserEmail }) => {
    const deleteButton = cms.getByRole("button", {
      name: `Delete ${cmsSeededUserEmail}`,
    })
    await expect(deleteButton).toBeEnabled()
    await deleteButton.click()

    await expect(cms.getByText(cmsSeededUserEmail)).toHaveCount(0)
  })
})
