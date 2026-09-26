import { describe, expect, it } from "@dev/vitest"

import { authPlugin } from "../auth"
import { NotImplementedError, type OberonPlugin } from "../lib/dtd"
import { initPlugins } from "./init-plugins"
import { mockPlugin } from "./mock-plugin"

describe("initPlugins key value store", { tags: ["ai", "issue-318"] }, () => {
  it("exposes a fallback KV contract before a database plugin implements it", async () => {
    const { adapter } = initPlugins()

    expect(() => adapter.getKV("tailwind", "state")).toThrow(
      new NotImplementedError(
        "No oberon plugin provided for getKV action, please check your oberon adapter configuration.",
      ),
    )
    expect(() => adapter.putKV("tailwind", "state", { activeHash: "abc123" })).toThrow(
      new NotImplementedError(
        "No oberon plugin provided for putKV action, please check your oberon adapter configuration.",
      ),
    )
    expect(() => adapter.deleteKV("tailwind", "state")).toThrow(
      new NotImplementedError(
        "No oberon plugin provided for deleteKV action, please check your oberon adapter configuration.",
      ),
    )
  })

  it("lets the mock plugin override KV methods with demo-only stubs", async () => {
    const { adapter } = initPlugins([mockPlugin])

    expect(() => adapter.getKV("mock-plugin", "state")).toThrow(
      new NotImplementedError("This action is not available in the demo"),
    )
    expect(() => adapter.putKV("mock-plugin", "state", { activeHash: "abc123" })).toThrow(
      new NotImplementedError("This action is not available in the demo"),
    )
    expect(() => adapter.deleteKV("mock-plugin", "state")).toThrow(
      new NotImplementedError("This action is not available in the demo"),
    )
  })

  it("uses deterministic plugin order when plugins provide auth storage", async () => {
    const validAuthCapabilityPlugin: OberonPlugin = () => ({
      name: "valid-better-auth-plugin",
      adapter: {
        sendVerificationRequest: async () => {},
      },
    })

    const missingAuthCapabilityPlugin: OberonPlugin = () => ({
      name: "missing-better-auth-plugin",
      adapter: {},
    })

    expect(() =>
      initPlugins([missingAuthCapabilityPlugin, validAuthCapabilityPlugin, authPlugin]),
    ).not.toThrow()

    expect(() =>
      initPlugins([validAuthCapabilityPlugin, missingAuthCapabilityPlugin, authPlugin]),
    ).not.toThrow()
  })
})

describe("initPlugins adapter hooks", { tags: ["ai", "issue-362"] }, () => {
  it("gives earlier hooks later capabilities while preserving middleware order", async () => {
    const events: string[] = []

    const provider: OberonPlugin = () => ({
      name: "provider",
      adapter: {
        addUser: async ({ payload: { user } }) => {
          events.push(`provider ${user.email}`)
          return { id: "user-1", ...user }
        },
      },
    })
    const middleware: OberonPlugin = () => ({
      name: "middleware",
      adapter: {
        addUser: async ({ adapter, next, payload: { user } }) => {
          events.push(String(await adapter.getKV("test", "suffix")))
          const result = await next({ user: { ...user, email: `${user.email}.forwarded` } })
          events.push(`returned ${result.id}`)
          return result
        },
      },
    })
    const laterCapability: OberonPlugin = () => ({
      name: "later-capability",
      adapter: {
        getKV: async ({ payload: { namespace, key } }) => {
          events.push(`${namespace}/${key}`)
          return "later capability"
        },
      },
    })

    const { adapter } = initPlugins([provider, middleware, laterCapability])

    await expect(adapter.addUser({ email: "user@example.com", role: "user" })).resolves.toEqual({
      id: "user-1",
      email: "user@example.com.forwarded",
      role: "user",
    })
    expect(events).toEqual([
      "test/suffix",
      "later capability",
      "provider user@example.com.forwarded",
      "returned user-1",
    ])
  })
})
