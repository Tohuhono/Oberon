import { describe, expect, fromPartial, it, vi } from "@dev/vitest"

import { defineConfig } from "../index"
import { NotImplementedError, type OberonClientConfig, type OberonPlugin } from "../lib/dtd"
import { bootstrapOberon } from "./bootstrap-oberon"
import { getInitialData } from "./get-initial-data"
import { createActionHandler } from "./init-action-handler"
import { initAdapter } from "./init-adapter"

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
    expect(initHandler).not.toHaveBeenCalled()

    await adapter.handleRequest(new Request("http://localhost/cms/api/test"), {
      method: "GET",
      path: ["test"],
    })
    await adapter.handleRequest(new Request("http://localhost/cms/api/test"), {
      method: "GET",
      path: ["test"],
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
        getAllFragments: () => async (type) =>
          type === "page"
            ? [{ key: "/database", type: "page", updatedAt: new Date(), updatedBy: "system" }]
            : [{ key: "/not-a-route", type: "shared", updatedAt: new Date(), updatedBy: "system" }],
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

  it.each(["/", "/guides/start"])("resolves Page data for %s", async (key) => {
    const page = getInitialData()
    const getFragmentData = vi.fn(async () => page)
    const plugin: OberonPlugin = () => ({
      name: "page-resolution",
      adapter: {
        getFragmentData: () => getFragmentData,
      },
    })
    const adapter = initAdapter({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    await expect(createActionHandler(adapter).resolvePath({ key })).resolves.toEqual({
      key,
      data: page.data,
    })
    expect(getFragmentData).toHaveBeenCalledExactlyOnceWith({ key, type: "page" })
  })

  it("resolves a missing Page through the routing adapter", async () => {
    const missing = new Error("not-found")
    const notFound = vi.fn((): never => {
      throw missing
    })
    const plugin: OberonPlugin = () => ({
      name: "missing-page",
      adapter: {
        getFragmentData: () => async () => null,
        notFound: () => notFound,
      },
    })
    const adapter = initAdapter({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    await expect(createActionHandler(adapter).resolvePath({ key: "/missing" })).rejects.toBe(
      missing,
    )
    expect(notFound).toHaveBeenCalledOnce()
  })

  it("checks Page permission before path resolution reads data", async () => {
    const getFragmentData = vi.fn(async () => getInitialData())
    const plugin: OberonPlugin = () => ({
      name: "private-pages",
      adapter: {
        hasPermission: () => () => false,
        getCurrentUser: () => async () => null,
        getFragmentData: () => getFragmentData,
      },
    })
    const adapter = initAdapter({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    await expect(createActionHandler(adapter).resolvePath({ key: "/private" })).rejects.toThrow(
      "You do not have permission to perform this action",
    )
    expect(getFragmentData).not.toHaveBeenCalled()
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
          getAllFragments: () => async () => [],
          getSite: () => async () => undefined,
          updateFragmentData: () => async () => new Date(),
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
                getAllFragments: () => async (type) =>
                  type === "page"
                    ? [
                        {
                          key: "/runtime",
                          type: "page",
                          updatedAt: new Date(),
                          updatedBy: "system",
                        },
                      ]
                    : [],
              }
            : {
                getAllFragments: () => async () => [],
                getSite: () => async () => undefined,
                updateFragmentData: () => async () => new Date(),
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

    await expect(adapter.getAllFragments("page")).resolves.toEqual([
      { key: "/runtime", type: "page", updatedAt: expect.any(Date), updatedBy: "system" },
    ])
    expect(phases).toEqual(["runtime", "bootstrap"])
  })

  it("runs bootstrap hooks sequentially before welcome page initialisation", async () => {
    const events: string[] = []

    const firstPlugin: OberonPlugin = ({ getAdapter }) => ({
      name: "first-plugin",
      adapter: {
        getAllFragments: () => async () => [],
        getSite: () => async () => undefined,
        updateFragmentData: () => async () => {
          events.push("welcome")
          return new Date()
        },
        updateSite: () => async () => {
          events.push("site")
        },
      },
      bootstrap: async () => {
        events.push(typeof getAdapter().will, "first")
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

    expect(events).toEqual(["function", "first", "second", "welcome", "site"])
  })
})

describe("Fragment publishing", { tags: ["ai", "feature-shared-components"] }, () => {
  it("returns the persisted timestamp after publishing a Fragment", async () => {
    const page = getInitialData()
    const persistedAt = new Date("2026-10-13T00:00:00.000Z")
    const plugin: OberonPlugin = () => ({
      name: "persisted-fragment-timestamp",
      adapter: {
        getCurrentUser: () => async () => ({
          id: "editor",
          email: "editor@example.com",
          role: "admin",
        }),
        getFragmentData: () => async () => ({ ...page, updatedAt: persistedAt }),
        updateFragmentData: () => async () => persistedAt,
      },
    })
    const adapter = initAdapter({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [plugin],
    })

    await expect(
      createActionHandler(adapter).publishFragmentData({
        key: page.key,
        type: "page",
        data: page.data,
        expectedUpdatedAt: page.updatedAt,
      }),
    ).resolves.toMatchObject({
      status: "success",
      result: { key: page.key, type: "page", updatedAt: persistedAt },
    })
  })
})
