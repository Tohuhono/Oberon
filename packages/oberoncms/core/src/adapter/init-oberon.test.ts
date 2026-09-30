import { describe, expect, fromPartial, it, vi } from "@dev/vitest"

import { defineConfig } from "../index"
import { NotImplementedError, type OberonClientConfig, type OberonPlugin } from "../lib/dtd"
import { bootstrapOberon } from "./bootstrap-oberon"
import { createActionHandler } from "./init-action-handler"
import { initAdapter } from "./init-adapter"
import { createRestHandler } from "./init-handler"

describe("adapter handlers", { tags: ["ai", "feature-runtime-composition"] }, () => {
  it("lazily initialises plugin handlers once with the final adapter", async () => {
    const get = vi.fn(() => new Response("ok"))
    const initHandler = vi.fn(() => ({ GET: get }))

    const plugin: OberonPlugin = () => ({
      name: "test-plugin",
      adapter: {
        getKV: () => async () => "composed capability",
      },
      handlers: {
        test: initHandler,
      },
    })

    const adapter = initAdapter({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })
    const restHandler = createRestHandler(adapter)

    expect(initHandler).not.toHaveBeenCalled()

    await restHandler.GET(new Request("http://localhost/cms/api/test"), {
      params: Promise.resolve({ path: ["test"] }),
    })
    await restHandler.GET(new Request("http://localhost/cms/api/test"), {
      params: Promise.resolve({ path: ["test"] }),
    })

    expect(initHandler).toHaveBeenCalledOnce()
    expect(initHandler).toHaveBeenCalledWith(adapter)
    await expect(adapter.getKV({ namespace: "test", key: "key" })).resolves.toBe(
      "composed capability",
    )
    expect(adapter.can).toEqual(expect.any(Function))
    expect(get).toHaveBeenCalledTimes(2)
  })

  it("returns action handlers backed by runtime adapter composition", async () => {
    const databasePlugin: OberonPlugin = () => ({
      name: "database-plugin",
      adapter: {
        getAllPages: () => async () => [
          { key: "/database", updatedAt: new Date(), updatedBy: "system" },
        ],
      },
    })

    const adapter = initAdapter({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [databasePlugin],
    })
    const actionHandler = createActionHandler(adapter)

    await expect(actionHandler.getAllPaths()).resolves.toEqual({
      status: "success",
      result: [{ path: ["database"] }],
    })
  })

  it("authorizes client actions without restricting the programmatic adapter", async () => {
    const plugin: OberonPlugin = () => ({
      name: "database-plugin",
      adapter: {
        getCurrentUser: () => async () => null,
        getAllUsers: () => async () => [{ id: "user-1", email: "user@example.com", role: "user" }],
      },
    })

    const adapter = initAdapter({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })
    const actionHandler = createActionHandler(adapter)

    await expect(adapter.getAllUsers()).resolves.toHaveLength(1)
    await expect(actionHandler.getAllUsers()).resolves.toEqual({
      status: "error",
      message: "You do not have permission to perform this action",
    })
  })

  it("exposes missing routing capabilities as NotImplementedError adapter methods", () => {
    const adapter = initAdapter({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [],
    })

    expect(() => adapter.redirect({ href: "/cms/pages" })).toThrow(NotImplementedError)
    expect(() => adapter.notFound()).toThrow(NotImplementedError)
  })
})

describe("phase-aware plugin composition", { tags: ["ai", "feature-runtime-composition"] }, () => {
  it("uses one Oberon config for runtime and bootstrap composition", async () => {
    const phases: string[] = []

    const plugin: OberonPlugin = ({ phase }) => {
      phases.push(phase)

      return {
        name: "shared-config-plugin",
        adapter: {
          getAllPages: () => async () => [],
          getSite: () => async () => undefined,
          updatePageData: () => async () => {},
          updateSite: () => async () => {},
        },
      }
    }

    const config = defineConfig({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    initAdapter(config)
    await bootstrapOberon(config)

    expect(phases).toEqual(["runtime", "bootstrap"])
  })

  it("passes runtime and bootstrap phase context to plugins", async () => {
    const phases: string[] = []

    const plugin: OberonPlugin = ({ phase }) => {
      phases.push(phase)

      return {
        name: "phase-aware-plugin",
        adapter:
          phase === "runtime"
            ? {
                getAllPages: () => async () => [
                  { key: "/runtime", updatedAt: new Date(), updatedBy: "system" },
                ],
              }
            : {
                getAllPages: () => async () => [],
                getSite: () => async () => undefined,
                updatePageData: () => async () => {},
                updateSite: () => async () => {},
              },
      }
    }

    const config = defineConfig({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    const adapter = initAdapter(config)
    await bootstrapOberon(config)

    await expect(adapter.getAllPages()).resolves.toEqual([
      { key: "/runtime", updatedAt: expect.any(Date), updatedBy: "system" },
    ])
    expect(phases).toEqual(["runtime", "bootstrap"])
  })

  it("runs bootstrap hooks sequentially before welcome page initialisation", async () => {
    const events: string[] = []

    const firstPlugin: OberonPlugin = () => ({
      name: "first-plugin",
      adapter: {
        getAllPages: () => async () => [],
        getSite: () => async () => undefined,
        updatePageData: () => async () => {
          events.push("welcome")
        },
        updateSite: () => async () => {
          events.push("site")
        },
      },
      bootstrap: async () => {
        events.push("first")
      },
    })

    const secondPlugin: OberonPlugin = () => ({
      name: "second-plugin",
      bootstrap: async () => {
        events.push("second")
      },
    })

    await bootstrapOberon({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [firstPlugin, secondPlugin],
    })

    expect(events).toEqual(["first", "second", "welcome", "site"])
  })
})
