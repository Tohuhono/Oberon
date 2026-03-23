import { expect, test } from "@dev/playwright/helpers/fixtures"

test.describe("CMS Routes", { tag: "@contract" }, () => {
  test("redirects /cms to /cms/pages", async ({ cms }) => {
    await cms.goto("/cms")
    await expect(cms).toHaveURL(/\/cms\/pages$/)
  })

  test("loads /cms/site", async ({ cms }) => {
    await cms.goto("/cms/site")
    await expect(cms.getByRole("link", { name: "Oberon CMS" })).toBeVisible()
  })

  test("loads /cms/pages", async ({ cms }) => {
    await cms.goto("/cms/pages")
    await expect(cms.getByRole("link", { name: "Manage Pages" })).toBeVisible()
  })

  test("loads /cms/images", async ({ cms }) => {
    await cms.goto("/cms/images")
    await expect(cms.getByRole("link", { name: "Manage Images" })).toBeVisible()
  })

  test("loads /cms/users", async ({ cms }) => {
    await cms.goto("/cms/users")
    await expect(cms.getByRole("link", { name: "Manage Users" })).toBeVisible()
  })

  test("loads /cms/edit", async ({ cms }) => {
    await cms.goto("/cms/edit")
    await expect(cms.getByRole("link", { name: "/" })).toBeVisible()
  })

  test("shows 404 for unknown cms route", async ({ cms }) => {
    await cms.goto("/cms/unknown-route")
    await expect(cms.getByText(/404 - page not found/i)).toBeVisible()
  })
})
