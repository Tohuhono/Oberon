import { expect, type Page } from "@playwright/test"

export const createPage = async (page: Page, key: string) => {
  await page.goto("/cms/pages")
  const textbox = page.getByRole("textbox")
  await expect(textbox).toBeEditable()
  await textbox.fill(key)
  const addPageButton = page.getByRole("button", { name: "Add Page" })
  await expect(addPageButton).toBeEnabled()
  await addPageButton.click()
  await expect(page.getByRole("link", { name: key, exact: true })).toBeVisible()
  await expect(
    page.getByLabel(`${key} updated by`, { exact: true }),
  ).toHaveText("test@tohuhono.com")
}

export const deletePages = async (page: Page, key: string) => {
  await page.goto("/cms/pages")

  const links = page.getByRole("link", { name: key })

  for (const _ of Array(await links.count())) {
    const pageKey = await links.first().innerText()
    expect(pageKey).toMatch(/.+/)
    await page
      .getByRole("button", { name: `Delete ${pageKey}`, exact: true })
      .click()
    await expect(
      page.getByRole("link", { name: pageKey, exact: true }),
    ).not.toBeVisible()
  }

  expect(await links.count()).toBe(0)
}
