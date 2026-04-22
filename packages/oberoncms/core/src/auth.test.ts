import { beforeEach, describe, expect, it } from "@dev/vitest"
import { vi } from "vitest"

const cookieState = {
  values: new Map<string, string>(),
  setCalls: [] as Array<{
    name: string
    value: string
    options?: Record<string, unknown>
  }>,
  reset() {
    this.values.clear()
    this.setCalls.length = 0
  },
}

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get(name: string) {
      const value = cookieState.values.get(name)

      return value ? { value } : undefined
    },
    set(name: string, value: string, options?: Record<string, unknown>) {
      cookieState.values.set(name, value)
      cookieState.setCalls.push({ name, value, options })
    },
  })),
}))

import { authPlugin, betterAuthPlugin } from "./auth"
import { stubbedAdapter } from "./adapter/stubbed-adapter"

describe(
  "authPlugin",
  { tags: ["ai", "feature-better-auth-migration"] },
  () => {
    beforeEach(() => {
      cookieState.reset()
      vi.unstubAllEnvs()
    })

    it("fails during better-auth plugin initialization when the capability is missing", async () => {
      expect(() => betterAuthPlugin(stubbedAdapter)).toThrow(
        "Missing required Better Auth capability on adapter.betterAuth",
      )
    })

    it("does not access the better-auth database during initialization", async () => {
      const adapter = {
        ...stubbedAdapter,
        betterAuth: Object.defineProperty({}, "database", {
          enumerable: true,
          get() {
            throw new Error("database accessed too early")
          },
        }),
      }

      expect(() => betterAuthPlugin(adapter)).not.toThrow()
    })

    it("issues an OTP through the send adapter for an existing user", async () => {
      const sendVerificationRequest = vi.fn(async () => {})

      const adapter = {
        ...stubbedAdapter,
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

    it("accepts the canonical verify endpoint for OTP completion", async () => {
      const adapter = {
        ...stubbedAdapter,
        sendVerificationRequest: vi.fn(async () => {}),
      }

      const plugin = authPlugin(adapter)
      const handler = plugin.handlers?.auth?.({} as never)

      if (!handler?.GET) {
        throw new Error("Expected auth plugin to expose GET auth handler")
      }

      const otpCookiePayload = Buffer.from(
        JSON.stringify({
          email: "test@tohuhono.com",
          token: "123456",
          user: {
            id: "user-1",
            email: "test@tohuhono.com",
            role: "admin",
          },
          expiresAt: Date.now() + 60_000,
        }),
        "utf8",
      ).toString("base64url")

      const response = await handler.GET(
        new Request(
          "http://localhost/cms/api/auth/verify?email=test%40tohuhono.com&token=123456&callbackUrl=%2Fcms%2Fpages",
          {
            headers: {
              cookie: `oberon-auth-otp=${encodeURIComponent(otpCookiePayload)}`,
            },
          },
        ) as never,
      )

      expect(response.status).toBe(200)
      expect(response.headers.get("set-cookie")).toContain(
        "oberon-auth-session=",
      )
    })

    it("allows MASTER_EMAIL recovery sign-in even when no users remain", async () => {
      vi.stubEnv("MASTER_EMAIL", "rescue@example.com")

      const adapter = {
        ...stubbedAdapter,
        getAllUsers: async () => [],
        sendVerificationRequest: vi.fn(async () => {}),
      }

      const plugin = authPlugin(adapter)

      if (!plugin.adapter?.signIn) {
        throw new Error("Expected auth plugin to expose signIn")
      }

      const handler = plugin.handlers?.auth?.({} as never)

      if (!handler?.GET) {
        throw new Error("Expected auth plugin to expose GET auth handler")
      }

      await plugin.adapter.signIn({ email: "rescue@example.com" })

      const otpCookiePayload = cookieState.values.get("oberon-auth-otp")

      if (!otpCookiePayload) {
        throw new Error("Expected signIn to persist an OTP cookie")
      }

      const pendingOtp = JSON.parse(
        Buffer.from(otpCookiePayload, "base64url").toString("utf8"),
      ) as {
        email: string
        token: string
      }

      const response = await handler.GET(
        new Request(
          `http://localhost/cms/api/auth/verify?email=${encodeURIComponent(pendingOtp.email)}&token=${encodeURIComponent(pendingOtp.token)}&callbackUrl=${encodeURIComponent("/cms/pages")}`,
          {
            headers: {
              cookie: `oberon-auth-otp=${encodeURIComponent(otpCookiePayload)}`,
            },
          },
        ) as never,
      )

      const setCookieHeader = response.headers.get("set-cookie")

      if (!setCookieHeader) {
        throw new Error("Expected verify response to issue a session cookie")
      }

      const sessionCookie = setCookieHeader.split(";")[0]?.split("=")[1]

      if (!sessionCookie || !plugin.adapter.getCurrentUser) {
        throw new Error("Expected auth plugin to expose getCurrentUser")
      }

      cookieState.values.set(
        "oberon-auth-session",
        decodeURIComponent(sessionCookie),
      )

      await expect(plugin.adapter.getCurrentUser()).resolves.toEqual({
        id: "rescue@example.com",
        email: "rescue@example.com",
        role: "admin",
      })
    })
  },
)
