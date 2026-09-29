import { describe, expect, fromPartial, it } from "@dev/vitest"

import { authPlugin } from "../auth"
import {
  NotImplementedError,
  type OberonAdapter,
  type OberonClientConfig,
  type OberonPlugin,
} from "../lib/dtd"
import { initAdapter } from "./init-adapter"
import { initPlugins } from "./init-plugins"
import { mockPlugin } from "./mock-plugin"

function initTestPlugins(plugins: OberonPlugin[] = []) {
  const state: { adapter?: OberonAdapter } = {}
  const getAdapter = () => {
    if (!state.adapter) {
      throw new Error("Adapter used before initialization")
    }
    return state.adapter
  }
  const initialisedPlugins = initPlugins(plugins, { getAdapter })
  const adapter = initAdapter({
    adapter: initialisedPlugins.adapter,
    config: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
    versions: initialisedPlugins.versions,
  })
  state.adapter = adapter

  return { ...initialisedPlugins, adapter }
}

describe("initPlugins key value store", { tags: ["ai", "issue-318"] }, () => {
  it("exposes a fallback KV contract before a database plugin implements it", async () => {
    const { adapter } = initTestPlugins()

    expect(() => adapter.getKV({ namespace: "tailwind", key: "state" })).toThrow(
      new NotImplementedError(
        "No oberon plugin provided for getKV action, please check your oberon adapter configuration.",
      ),
    )
    expect(() =>
      adapter.putKV({ namespace: "tailwind", key: "state", value: { activeHash: "abc123" } }),
    ).toThrow(
      new NotImplementedError(
        "No oberon plugin provided for putKV action, please check your oberon adapter configuration.",
      ),
    )
    expect(() => adapter.deleteKV({ namespace: "tailwind", key: "state" })).toThrow(
      new NotImplementedError(
        "No oberon plugin provided for deleteKV action, please check your oberon adapter configuration.",
      ),
    )
  })

  it("lets the mock plugin override KV methods with demo-only stubs", async () => {
    const { adapter } = initTestPlugins([mockPlugin])

    expect(() => adapter.getKV({ namespace: "mock-plugin", key: "state" })).toThrow(
      new NotImplementedError("This action is not available in the demo"),
    )
    expect(() =>
      adapter.putKV({
        namespace: "mock-plugin",
        key: "state",
        value: { activeHash: "abc123" },
      }),
    ).toThrow(new NotImplementedError("This action is not available in the demo"))
    expect(() => adapter.deleteKV({ namespace: "mock-plugin", key: "state" })).toThrow(
      new NotImplementedError("This action is not available in the demo"),
    )
  })

  it("uses deterministic plugin order when plugins provide auth storage", async () => {
    const validAuthCapabilityPlugin: OberonPlugin = () => ({
      name: "valid-better-auth-plugin",
      adapter: {
        sendVerificationRequest: () => async () => {},
      },
    })

    const missingAuthCapabilityPlugin: OberonPlugin = () => ({
      name: "missing-better-auth-plugin",
      adapter: {},
    })

    expect(() =>
      initTestPlugins([missingAuthCapabilityPlugin, validAuthCapabilityPlugin, authPlugin]),
    ).not.toThrow()

    expect(() =>
      initTestPlugins([validAuthCapabilityPlugin, missingAuthCapabilityPlugin, authPlugin]),
    ).not.toThrow()
  })
})

describe("initPlugins adapter hooks", { tags: ["ai", "issue-362"] }, () => {
  it("gives earlier hooks later capabilities while preserving middleware order", async () => {
    const events: string[] = []

    const provider: OberonPlugin = () => ({
      name: "provider",
      adapter: {
        addUser: () => async (user) => {
          events.push(`provider ${user.email}`)
          return { id: "user-1", ...user }
        },
      },
    })
    const middleware: OberonPlugin = () => ({
      name: "middleware",
      adapter: {
        addUser:
          ({ getAdapter, next }) =>
          async (user) => {
            events.push(typeof getAdapter().will)
            events.push(String(await getAdapter().getKV({ namespace: "test", key: "suffix" })))
            const result = await next({ ...user, email: `${user.email}.forwarded` })
            events.push(`returned ${result.id}`)
            return result
          },
      },
    })
    const laterCapability: OberonPlugin = () => ({
      name: "later-capability",
      adapter: {
        getKV:
          () =>
          async ({ namespace, key }) => {
            events.push(`${namespace}/${key}`)
            return "later capability"
          },
      },
    })

    const { adapter } = initTestPlugins([provider, middleware, laterCapability])

    await expect(adapter.addUser({ email: "user@example.com", role: "user" })).resolves.toEqual({
      id: "user-1",
      email: "user@example.com.forwarded",
      role: "user",
    })
    expect(events).toEqual([
      "function",
      "test/suffix",
      "later capability",
      "provider user@example.com.forwarded",
      "returned user-1",
    ])
  })

  it("rejects final adapter access while hook factories are composing", () => {
    const eagerPlugin: OberonPlugin = () => ({
      name: "eager-plugin",
      adapter: {
        addUser: ({ getAdapter, next }) => {
          expect(getAdapter).toThrow("Adapter used before initialization")
          return next
        },
      },
    })

    expect(() => initTestPlugins([eagerPlugin])).not.toThrow()
  })
})
