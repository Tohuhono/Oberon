import { describe, expect, it } from "@dev/vitest"
import type { OberonConfig, OberonPlugin } from "../lib/dtd"
import { initOberon } from "./init-oberon"

const config = {
  version: 1,
  components: {},
} as OberonConfig

const tailwindPlugin: OberonPlugin = () => ({
  name: "tailwind-test-plugin",
  adapter: {
    getTailwindAsset: async (hash) => {
      if (hash !== "known-hash") {
        return null
      }

      return {
        hash,
        classList: ["text-lg"],
        css: ":root { color: red; }",
      }
    },
  },
})

describe("initOberon tailwind handler", { tags: ["ai", "issue-314"] }, () => {
  it("serves immutable tailwind assets by hash", async () => {
    const { handler } = initOberon({
      config,
      plugins: [tailwindPlugin],
      tailwind: { sourceCssFile: "/ignored.css" },
    })

    const response = await handler.GET(
      new Request(
        "http://example.test/cms/api/tailwind/known-hash.css",
      ) as never,
      { params: Promise.resolve({ path: ["tailwind", "known-hash.css"] }) },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toContain("immutable")
    expect(response.headers.get("content-type")).toContain("text/css")
    await expect(response.text()).resolves.toContain(":root")
  })

  it("returns 404 when the asset path is not a css file or the hash is unknown", async () => {
    const { handler } = initOberon({
      config,
      plugins: [tailwindPlugin],
      tailwind: { sourceCssFile: "/ignored.css" },
    })

    const invalidExtensionResponse = await handler.GET(
      new Request("http://example.test/cms/api/tailwind/known-hash") as never,
      { params: Promise.resolve({ path: ["tailwind", "known-hash"] }) },
    )
    const missingAssetResponse = await handler.GET(
      new Request(
        "http://example.test/cms/api/tailwind/missing-hash.css",
      ) as never,
      { params: Promise.resolve({ path: ["tailwind", "missing-hash.css"] }) },
    )

    expect(invalidExtensionResponse.status).toBe(404)
    expect(missingAssetResponse.status).toBe(404)
  })

  it("returns 405 for unsupported methods", async () => {
    const { handler } = initOberon({
      config,
      plugins: [tailwindPlugin],
      tailwind: { sourceCssFile: "/ignored.css" },
    })

    const response = await handler.POST(
      new Request("http://example.test/cms/api/tailwind/known-hash.css", {
        method: "POST",
      }) as never,
      { params: Promise.resolve({ path: ["tailwind", "known-hash.css"] }) },
    )

    expect(response.status).toBe(405)
  })
})
