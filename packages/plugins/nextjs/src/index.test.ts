import { describe, expect, fromPartial, it } from "@dev/vitest"
import { type OberonClientConfig, type OberonPlugin } from "@oberoncms/core"
import { initOberon } from "@oberoncms/core/adapter"
import { unstable_rethrow } from "next/navigation"
import { vi } from "vitest"

import { plugin as nextPlugin } from "./index"

vi.mock("better-auth/next-js", () => ({
  nextCookies: () => ({ id: "next-cookies" }),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  unstable_cache: (action: unknown) => action,
  updateTag: vi.fn(),
}))

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: "oberon=1" }),
}))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
  unstable_rethrow: vi.fn((error: unknown) => {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }
  }),
}))

describe("Next action transport", () => {
  it("rethrows Next control-flow errors before returning an Oberon response", async () => {
    const controlFlowError = new Error("NEXT_REDIRECT")
    const throwingPlugin: OberonPlugin = () => ({
      name: "throwing-plugin",
      adapter: {
        signOut: async () => {
          throw controlFlowError
        },
      },
    })

    const { actions } = initOberon({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [nextPlugin, throwingPlugin],
    })

    await expect(actions.signOut()).rejects.toBe(controlFlowError)
    expect(unstable_rethrow).toHaveBeenCalledWith(controlFlowError)
  })

  it("returns a generic Oberon error response for ordinary application errors", async () => {
    const applicationError = new Error("boom")
    const throwingPlugin: OberonPlugin = () => ({
      name: "throwing-plugin",
      adapter: {
        signOut: async () => {
          throw applicationError
        },
      },
    })

    const { actions } = initOberon({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [nextPlugin, throwingPlugin],
    })

    await expect(actions.signOut()).resolves.toEqual({ status: "error" })
    expect(unstable_rethrow).toHaveBeenCalledWith(applicationError)
  })
})
