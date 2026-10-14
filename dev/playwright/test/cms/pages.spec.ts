import { insertTextComponent } from "@dev/playwright/helpers/editor"
import { expect, expectCmsPagePersisted, test } from "@dev/playwright/helpers/fixtures"
import type { Route } from "@playwright/test"

test.describe("CMS Pages Actions", { tag: "@cms" }, () => {
  test("shows add page button", async ({ cms }) => {
    await cms.goto("/cms/pages")
    await expect(cms.getByRole("button", { name: "Add Page" })).toBeVisible()
  })

  test("adds a page", async ({ cms, cmsSeededPageKey }) => {
    await expect(cms.getByRole("link", { name: cmsSeededPageKey, exact: true })).toBeVisible()
    await expectCmsPagePersisted(cms, cmsSeededPageKey)
  })

  test("keeps a new page pending until saving and refreshing finish", async ({
    cms,
    cmsSeededPageKey,
  }) => {
    const key = `${cmsSeededPageKey}_pending`
    let addRequest: Route | undefined
    let refreshRequest: Route | undefined
    let awaitingRefresh = false

    await cms.route("**/*", (route) => {
      const request = route.request()
      if (request.method() === "POST" && request.postData()?.includes(key)) {
        addRequest = route
        return
      }
      if (
        awaitingRefresh &&
        request.method() === "GET" &&
        new URL(request.url()).pathname.startsWith("/_serverFn/")
      ) {
        refreshRequest = route
        return
      }
      return route.continue()
    })

    await cms.getByLabel("Page path", { exact: true }).fill(key)
    await cms.getByRole("button", { name: "Add Page", exact: true }).click()
    await expect.poll(() => Boolean(addRequest)).toBe(true)

    if (!addRequest) {
      throw new Error("Add Page request was not intercepted")
    }

    try {
      await expect(cms.getByRole("button", { name: "Add Page", exact: true })).toBeDisabled()
      await expect(cms.getByRole("link", { name: key, exact: true })).toBeVisible()
      await expect(cms.getByRole("button", { name: `Copy ${key}`, exact: true })).toBeDisabled()
      await expect(cms.getByRole("button", { name: `Delete ${key}`, exact: true })).toBeDisabled()
      await expect(cms.locator(`a[href="/cms/edit${key}"]`)).toHaveCount(0)

      const refreshesSeparately = !addRequest.request().headers()["next-action"]
      const heldAddRequest = addRequest
      addRequest = undefined
      awaitingRefresh = true
      await heldAddRequest.continue()

      if (refreshesSeparately) {
        await expect.poll(() => Boolean(refreshRequest)).toBe(true)
        await expect(cms.getByRole("button", { name: "Add Page", exact: true })).toBeDisabled()
        await expect(cms.getByRole("link", { name: key, exact: true })).toBeVisible()
        await expect(cms.getByRole("button", { name: `Delete ${key}`, exact: true })).toBeDisabled()
      }
    } finally {
      awaitingRefresh = false
      await addRequest?.continue()
      await refreshRequest?.continue()
      await cms.unroute("**/*")
    }

    await expectCmsPagePersisted(cms, key)
    await expect(cms.getByRole("button", { name: "Add Page", exact: true })).toBeEnabled()
    await cms.reload()
    await expect(cms.getByRole("link", { name: key, exact: true })).toHaveCount(1)
    await expectCmsPagePersisted(cms, key)
  })

  test("copies a page", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto("/cms/pages")

    await cms.getByRole("button", { name: `Copy ${cmsSeededPageKey}`, exact: true }).click()

    await expect(
      cms.getByRole("link", { name: `${cmsSeededPageKey}_copy`, exact: true }),
    ).toBeVisible()

    await expect(
      cms.getByLabel(`${cmsSeededPageKey}_copy updated by`, { exact: true }),
    ).toBeVisible()
  })

  test("deletes a page", async ({ cms, cmsSeededPageKey }) => {
    await cms.goto("/cms/pages")

    await cms.getByRole("button", { name: `Delete ${cmsSeededPageKey}`, exact: true }).click()

    await expect(cms.getByRole("link", { name: cmsSeededPageKey, exact: true })).not.toBeVisible()
  })

  test(
    "does not show old content after deleting and recreating a Page",
    { tag: "@playground" },
    async ({ cms, cmsSeededPageKey, page, request, testKey }) => {
      const text = `Deleted page ${testKey}`
      const htmlHeaders = { Accept: "text/html" }
      await cms.goto(`/cms/edit${cmsSeededPageKey}`)
      await insertTextComponent(cms)
      await cms.locator('textarea[name="text"]').fill(text)
      await cms.getByRole("button", { name: "Publish", exact: true }).click()
      await expect(
        cms.getByText(`Successfully published ${cmsSeededPageKey}`, { exact: true }),
      ).toBeVisible()

      const published = await page.goto(cmsSeededPageKey)
      expect(published?.status()).toBe(200)
      await expect(page.getByText(text, { exact: true })).toBeVisible()
      await page.reload()
      await expect(page.getByText(text, { exact: true })).toBeVisible()

      await cms.goto("/cms/pages")
      await cms.getByRole("button", { name: `Delete ${cmsSeededPageKey}`, exact: true }).click()
      await expect(cms.getByRole("link", { name: cmsSeededPageKey, exact: true })).toBeHidden()
      const deleted = await page.reload()
      expect(deleted?.status()).toBe(404)
      await expect(page.getByText(text, { exact: true })).toBeHidden()

      await cms.getByLabel("Page path", { exact: true }).fill(cmsSeededPageKey)
      await cms.getByRole("button", { name: "Add Page", exact: true }).click()
      await expectCmsPagePersisted(cms, cmsSeededPageKey)
      const recreated = await request.get(cmsSeededPageKey, { headers: htmlHeaders })
      expect(recreated.status()).toBe(200)
      expect(await recreated.text()).not.toContain(text)
      await page.reload()
      await expect(page.getByText(text, { exact: true })).toBeHidden()
    },
  )
})
