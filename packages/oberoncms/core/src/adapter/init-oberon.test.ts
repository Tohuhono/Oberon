import { describe, expect, fromPartial, it, vi } from "@dev/vitest"

import { defineConfig } from "../index"
import { NotImplementedError, type OberonClientConfig, type OberonPlugin } from "../lib/dtd"
import { bootstrapOberon } from "./bootstrap-oberon"
import { initOberon } from "./init-oberon"

describe("initOberon handlers", { tags: ["ai", "feature-runtime-composition"] }, () => {
  it("initialises plugin handlers once during runtime composition", async () => {
    const get = vi.fn(() => new Response("ok"))
    const initHandler = vi.fn(() => ({ GET: get }))

    const plugin: OberonPlugin = () => ({
      name: "test-plugin",
      handlers: {
        test: initHandler,
      },
    })

    const { handler, adapter } = initOberon({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    await handler.GET(new Request("http://localhost/cms/api/test") as never, {
      params: Promise.resolve({ path: ["test"] }),
    })
    await handler.GET(new Request("http://localhost/cms/api/test") as never, {
      params: Promise.resolve({ path: ["test"] }),
    })

    expect(initHandler).toHaveBeenCalledOnce()
    expect(initHandler).toHaveBeenCalledWith(adapter)
    expect(get).toHaveBeenCalledTimes(2)
  })

  it("returns plugin-composed actions from runtime composition", async () => {
    const databasePlugin: OberonPlugin = () => ({
      name: "database-plugin",
      adapter: {
        getAllPages: async () => [{ key: "/database", updatedAt: new Date(), updatedBy: "system" }],
      },
    })

    const actionPlugin: OberonPlugin = () => ({
      name: "action-plugin",
      actions: (_actions, adapter) => ({
        describeSite: async () => ({
          status: "success",
          result: (await adapter.getAllPaths()).at(0)?.path.join("/") ?? "missing",
        }),
      }),
    })

    const decoratorPlugin: OberonPlugin = () => ({
      name: "decorator-plugin",
      actions: (actions, adapter) => ({
        describeSite: async () => {
          const describeSite = actions.describeSite

          if (!describeSite) {
            throw new Error("Expected describeSite action to be composed")
          }

          const response = await describeSite()

          return {
            status: "success",
            result: `${response.status}:${response.result}:${(await adapter.getAllPaths()).length}`,
          }
        },
      }),
    })

    const { actions } = initOberon({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [databasePlugin, actionPlugin, decoratorPlugin],
    })

    const describeSite = actions.describeSite

    if (!describeSite) {
      throw new Error("Expected describeSite action to be composed")
    }

    await expect(describeSite()).resolves.toEqual({
      status: "success",
      result: "success:database:1",
    })
  })

  it("exposes missing routing capabilities as NotImplementedError adapter methods", () => {
    const { adapter } = initOberon({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [],
    })

    expect(() => adapter.redirect("/cms/pages")).toThrow(NotImplementedError)
    expect(() => adapter.notFound()).toThrow(NotImplementedError)
  })
})

describe("phase-aware plugin composition", { tags: ["ai", "feature-runtime-composition"] }, () => {
  it("uses one Oberon config for runtime and bootstrap composition", async () => {
    const phases: string[] = []

    const plugin: OberonPlugin = (_adapter, { phase } = { phase: "runtime" }) => {
      phases.push(phase)

      return {
        name: "shared-config-plugin",
        adapter: {
          getAllPages: async () => [],
          getSite: async () => undefined,
          updatePageData: async () => {},
          updateSite: async () => {},
        },
      }
    }

    const config = defineConfig({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    initOberon(config)
    await bootstrapOberon(config)

    expect(phases).toEqual(["runtime", "bootstrap"])
  })

  it("passes runtime and bootstrap phase context to plugins", async () => {
    const phases: string[] = []

    const plugin: OberonPlugin = (_adapter, { phase } = { phase: "runtime" }) => {
      phases.push(phase)

      return {
        name: "phase-aware-plugin",
        adapter:
          phase === "runtime"
            ? {
                getAllPages: async () => [
                  { key: "/runtime", updatedAt: new Date(), updatedBy: "system" },
                ],
              }
            : {
                getAllPages: async () => [],
                getSite: async () => undefined,
                updatePageData: async () => {},
                updateSite: async () => {},
              },
      }
    }

    const config = defineConfig({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    const { adapter } = initOberon(config)
    await bootstrapOberon(config)

    await expect(adapter.getAllPages()).resolves.toEqual([
      { key: "/runtime", updatedAt: expect.any(Date), updatedBy: "system" },
    ])
    expect(phases).toEqual(["runtime", "bootstrap"])
  })

  it("runs bootstrap hooks in middleware order before welcome page initialisation", async () => {
    const events: string[] = []

    const firstPlugin: OberonPlugin = () => ({
      name: "first-plugin",
      adapter: {
        getAllPages: async () => [],
        getSite: async () => undefined,
        updatePageData: async () => {
          events.push("welcome")
        },
        updateSite: async () => {
          events.push("site")
        },
      },
      bootstrap: async (next) => {
        events.push("first before")
        await next()
        events.push("first after")
      },
    })

    const secondPlugin: OberonPlugin = () => ({
      name: "second-plugin",
      bootstrap: async (next) => {
        events.push("second before")
        await next()
        events.push("second after")
      },
    })

    await bootstrapOberon({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [firstPlugin, secondPlugin],
    })

    expect(events).toEqual([
      "second before",
      "first before",
      "first after",
      "second after",
      "welcome",
      "site",
    ])
  })
})
