import { describe, expect, fromPartial, it, vi } from "@dev/vitest"
import type { OberonConfig, OberonPlugin } from "../lib/dtd"
import { initOberon } from "./init-oberon"

describe(
  "initAdapter permissions",
  { tags: ["ai", "feature-better-auth-migration"] },
  () => {
    it("uses the current session user when anonymous access is denied", async () => {
      const getCurrentUser = vi.fn(async () => ({
        id: "user-1",
        email: "editor@example.com",
        role: "admin" as const,
      }))

      const hasPermission = vi.fn(
        ({ user }: { user?: { role: "user" | "admin" } | null }) => {
          return user?.role === "admin"
        },
      )

      const plugin: OberonPlugin = () => ({
        name: "test-plugin",
        adapter: {
          prebuild: async () => {},
          getCurrentUser,
          hasPermission,
          signIn: async () => {},
          signOut: async () => {},
          sendVerificationRequest: async () => {},
        },
      })

      const oberon = initOberon({
        config: fromPartial<OberonConfig>({ version: 1, components: {} }),
        plugins: [plugin],
      })

      await expect(oberon.adapter.can("pages", "write")).resolves.toBe(true)
      expect(hasPermission).toHaveBeenNthCalledWith(1, {
        action: "pages",
        permission: "write",
      })
      expect(getCurrentUser).toHaveBeenCalledTimes(1)
      expect(hasPermission).toHaveBeenNthCalledWith(2, {
        user: {
          id: "user-1",
          email: "editor@example.com",
          role: "admin",
        },
        action: "pages",
        permission: "write",
      })
    })
  },
)
