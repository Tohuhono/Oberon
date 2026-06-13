import { describe, expect, fromPartial, it, vi } from "@dev/vitest"

import type { OberonAdapter, OberonClientConfig, OberonServerActions } from "./lib/dtd"
import { OberonProvider } from "./provider"
import { Render } from "./render"

describe("server routing surfaces", { tags: ["ai", "feature-remove-nextjs-from-core"] }, () => {
  it("redirects through the adapter when no CMS action is provided", async () => {
    const redirect = vi.fn((href: string): never => {
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

    expect(redirect).toHaveBeenCalledWith("/cms/pages")
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

  it("not-founds through the adapter when public page data is missing", async () => {
    const notFound = vi.fn((): never => {
      throw new Error("not-found")
    })

    await expect(
      Render({
        path: ["missing"],
        config: fromPartial<OberonClientConfig>({ components: {} }),
        adapter: fromPartial<OberonAdapter>({
          getPageData: async () => null,
          notFound,
        }),
      }),
    ).rejects.toThrow("not-found")

    expect(notFound).toHaveBeenCalledOnce()
  })
})
