import { describe, expect, it, vi } from "@dev/vitest"
import { authPlugin } from "./auth"
import { stubbedAdapter } from "./adapter/stubbed-adapter"

describe(
  "authPlugin",
  { tags: ["ai", "feature-better-auth-migration"] },
  () => {
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
  },
)
