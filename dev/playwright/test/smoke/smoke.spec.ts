import { test, expect } from "@playwright/test"

test.describe("Smoke Tests", { tag: "@smoke" }, () => {
  test("homepage loads", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
  })

  test("CMS route loads", async ({ page }) => {
    const response = await page.goto("/cms")
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("unknown route returns 404", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz")
    await expect(page.getByText("404 - page not found")).toBeVisible()
  })
})

test.describe("CMS Smoke Tests", { tag: ["@smoke", "@cms", "@playground"] }, () => {
  test("cms homepage loads", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("heading", { name: "Welcome to OberonCMS" })).toBeVisible()
  })

  // https://github.com/vercel/next.js/issues/62228
  test("not-found markup and inline theme script work without hydration", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await page.addInitScript(() => localStorage.setItem("oberon:theme", "dark"))
    await page.route("**/*", async (route) => {
      if (route.request().resourceType() === "script") {
        await route.abort()
      } else {
        await route.continue()
      }
    })

    const response = await page.goto("/nonexistent-page-xyz/inline-script-regression", {
      waitUntil: "domcontentloaded",
    })
    expect(response?.status()).toBe(404)
    expect(response?.headers()["content-type"]).toContain("text/html")

    const html = await response!.text()
    const markup = html.replace(/<script\b[\s\S]*?<\/script>/gi, "")
    expect(markup).toMatch(/<h1\b[^>]*>404 - page not found<\/h1>/)
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]
    expect(head).toContain("oberon:theme")
    expect(head).toContain('document.documentElement.classList.add("dark")')

    await expect(page.getByRole("heading", { name: "404 - page not found" })).toBeVisible()
    await expect(page.locator("html")).toHaveClass(/\bdark\b/)
  })

  test("not-found theme survives hydration", async ({ page }) => {
    const scriptWarnings: string[] = []
    page.on("console", (message) => {
      if (
        /scripts inside React components|hydration failed|hydration mismatch/i.test(message.text())
      ) {
        scriptWarnings.push(message.text())
      }
    })
    await page.emulateMedia({ colorScheme: "light" })
    await page.addInitScript(() => localStorage.setItem("oberon:theme", "dark"))

    await page.goto("/nonexistent-page-xyz/hydration-regression")
    await expect(page.getByRole("heading", { name: "404 - page not found" })).toBeVisible()
    await expect(page.locator("html")).toHaveClass(/\bdark\b/)
    expect(scriptWarnings).toEqual([])
  })
})

test.describe("Docs Smoke Tests", { tag: ["@smoke", "@docs"] }, () => {
  test("docs index loads", async ({ page }) => {
    const response = await page.goto("/docs")
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  for (const { path, heading } of [
    { path: "/docs/configuration", heading: "Configuration" },
    { path: "/docs/plugins/custom/plugin-shape", heading: "Plugin shape" },
  ]) {
    test(`${path} loads`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible()
    })
  }

  test("duplicated docs prefix returns 404", async ({ page }) => {
    const response = await page.goto("/docs/docs/configuration")
    expect(response?.status()).toBe(404)
    await expect(page.getByText("404 - page not found")).toBeVisible()
  })
})
