import { beforeEach, describe, expect, fromPartial, it } from "@dev/vitest"
import { memoryAdapter } from "better-auth/adapters/memory"
import { vi } from "vitest"

import { bootstrapOberon } from "./adapter/bootstrap-oberon"
import { stubbedAdapter } from "./adapter/stubbed-adapter"
import { authPlugin } from "./auth"
import { type OberonClientConfig, type OberonPlugin } from "./lib/dtd"

function createMemoryDbUser(email: string, id: string) {
  const now = new Date()

  return {
    id,
    email,
    emailVerified: true,
    name: email,
    image: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
  }
}

describe("authPlugin", { tags: ["ai", "feature-better-auth-migration"] }, () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it("initializes when the better-auth capability is missing", async () => {
    expect(() => authPlugin(stubbedAdapter)).not.toThrow()
  })

  it("issues an OTP through the send adapter for an existing user", async () => {
    const sendVerificationRequest = vi.fn(async () => {})

    const adapter = {
      ...stubbedAdapter,
      betterAuth: {
        database: memoryAdapter({
          user: [createMemoryDbUser("test@tohuhono.com", "user-1")],
          verification: [],
        }),
      },
      getAllUsers: async () => [
        {
          id: "mock-admin",
          email: "test@tohuhono.com",
          role: "admin" as const,
        },
      ],
      sendVerificationRequest,
    }

    const plugin = authPlugin(adapter)

    if (!plugin.adapter?.signIn) {
      throw new Error("Expected auth plugin to expose signIn")
    }

    await plugin.adapter.signIn({ email: "test@tohuhono.com" })

    expect(sendVerificationRequest).toHaveBeenCalledTimes(1)
    expect(sendVerificationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@tohuhono.com",
        token: expect.stringMatching(/^\d{6}$/),
        url: expect.stringContaining("/cms/login"),
      }),
    )
  })

  it("issues an OTP for an adapter-managed existing user in better-auth lane", async () => {
    const sendVerificationRequest = vi.fn(async () => {})

    const adapter = {
      ...stubbedAdapter,
      betterAuth: {
        database: memoryAdapter({
          user: [createMemoryDbUser("editor@example.com", "user-2")],
          verification: [],
        }),
      },
      getAllUsers: async () => [
        {
          id: "user-2",
          email: "editor@example.com",
          role: "user" as const,
        },
      ],
      sendVerificationRequest,
    }

    const plugin = authPlugin(adapter)

    if (!plugin.adapter?.signIn) {
      throw new Error("Expected auth plugin to expose signIn")
    }

    await plugin.adapter.signIn({ email: "editor@example.com" })

    expect(sendVerificationRequest).toHaveBeenCalledTimes(1)
    expect(sendVerificationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "editor@example.com",
        token: expect.stringMatching(/^\d{6}$/),
        url: expect.stringContaining("/cms/login"),
      }),
    )
  })

  it("creates MASTER_EMAIL admin during bootstrap when no users remain", async () => {
    vi.stubEnv("MASTER_EMAIL", "rescue@example.com")

    const addUser = vi.fn(async () => ({
      id: "rescue-admin",
      email: "rescue@example.com",
      role: "admin" as const,
    }))

    const storagePlugin: OberonPlugin = () => {
      return {
        name: "storage-plugin",
        adapter: {
          betterAuth: {
            database: memoryAdapter({
              user: [],
              verification: [],
            }),
          },
          getAllUsers: async () => [],
          addUser,
          sendVerificationRequest: vi.fn(async () => {}),
          getAllPages: async () => [{ key: "/", updatedAt: new Date(), updatedBy: "system" }],
          getSite: async () => undefined,
          updateSite: async () => {},
        },
      }
    }

    await bootstrapOberon({
      client: fromPartial<OberonClientConfig>({ version: 1, components: {} }),
      plugins: [storagePlugin, authPlugin],
    })

    expect(addUser).toHaveBeenCalledTimes(1)
    expect(addUser).toHaveBeenCalledWith({
      email: "rescue@example.com",
      role: "admin",
    })
  })

  it("forwards auth route handling to Better Auth handlers", async () => {
    const adapter = {
      ...stubbedAdapter,
      betterAuth: {
        database: memoryAdapter({}),
      },
      sendVerificationRequest: vi.fn(async () => {}),
    }

    const plugin = authPlugin(adapter)

    const handler = plugin.handlers?.auth?.({} as never)

    if (!handler?.GET) {
      throw new Error("Expected auth plugin to expose GET auth handler")
    }

    const response = await handler.GET(new Request("http://localhost/cms/api/auth/verify") as never)

    expect(response.status).toBe(404)
  })
})
