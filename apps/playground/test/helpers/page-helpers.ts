import { expect, type Browser } from "@playwright/test"

export const createPage = async (browser: Browser, key: string) => {
  const page = await browser.newPage()
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

export const deletePages = async (browser: Browser, key: string) => {
  const page = await browser.newPage()

  await page.goto("/cms/pages")

  const links = page.getByRole("link", { name: key })

  for (const _ of Array(await links.count())) {
    const key = await links.first().innerText()
    expect(key).toMatch(/.+/)
    await page
      .getByRole("button", { name: `Delete ${key}`, exact: true })
      .click()
    await expect(
      page.getByRole("link", { name: key, exact: true }),
    ).not.toBeVisible()
  }

  expect(await links.count()).toBe(0)
}
