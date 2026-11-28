import { describe, expect, fromPartial, it, vi } from "@dev/vitest"

import type { OberonAdapter, OberonServerActions, OberonSharedComponentRecord } from "./lib/dtd"
import { getMetaData } from "./lib/get-metadata"
import { getOberonClientContext, OberonProvider } from "./provider"

describe("server routing surfaces", { tags: ["ai", "feature-remove-nextjs-from-core"] }, () => {
  it("redirects through the adapter when no CMS action is provided", async () => {
    const redirect = vi.fn(({ href }: { href: string }): never => {
      throw new Error(`redirect:${href}`)
    })

    await expect(
      OberonProvider({
        children: null,
        adapter: fromPartial<OberonAdapter>({ redirect }),
        actions: fromPartial<OberonServerActions>({}),
        path: [],
        searchParams: {},
      }),
    ).rejects.toThrow("redirect:/cms/pages")

    expect(redirect).toHaveBeenCalledWith({ href: "/cms/pages" })
  })

  it("not-founds through the adapter when the CMS action is unknown", async () => {
    const notFound = vi.fn((): never => {
      throw new Error("not-found")
    })

    await expect(
      OberonProvider({
        children: null,
        adapter: fromPartial<OberonAdapter>({ notFound }),
        actions: fromPartial<OberonServerActions>({}),
        path: ["unknown"],
        searchParams: {},
      }),
    ).rejects.toThrow("not-found")

    expect(notFound).toHaveBeenCalledOnce()
  })

  it("reads preview and metadata for a Shared component by its key", async () => {
    const source: OberonSharedComponentRecord = {
      key: "shared-banner",
      type: "shared",
      data: { name: "Banner", tree: { content: [], root: {} }, exposures: [], defaults: {} },
      updatedAt: new Date(),
      updatedBy: "editor@example.com",
    }
    const adapter = fromPartial<OberonAdapter>({
      can: async () => true,
      listComponents: async () => [],
      getComponent: async ({ key }: { key: string }) => (key === source.key ? source : null),
    })

    await expect(
      getOberonClientContext({ adapter, path: ["preview"], searchParams: { key: source.key } }),
    ).resolves.toMatchObject({ action: "preview", slug: source.key, data: source.data.tree })
    await expect(getMetaData(adapter, source.key)).resolves.toEqual({ title: source.data.name })
  })

  it.each([
    ["/cms/edit/", "/cms/edit/"],
    ["/cms/edit/guides/start", "/cms/edit/guides/start"],
    ["https://example.test/cms/edit/", null],
    ["/cms/edit/%2e%2e/pages", null],
    ["/cms/edit/../pages", null],
  ])("checks a Shared source return path of %s", async (returnTo, expected) => {
    const adapter = fromPartial<OberonAdapter>({
      can: async () => true,
      listComponents: async () => [],
    })
    await expect(
      getOberonClientContext({ adapter, path: ["library"], searchParams: { returnTo } }),
    ).resolves.toMatchObject({ action: "library", data: { returnTo: expected } })
  })
})
