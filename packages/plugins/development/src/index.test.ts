import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { afterEach, beforeEach, describe, expect, it, vi } from "@dev/vitest"
import type { OberonPluginAdapter } from "@oberoncms/core"

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../",
)

function createBaseAdapter(): OberonPluginAdapter {
  return {
    prebuild: async () => {},
    getCurrentUser: async () => null,
    hasPermission: () => true,
    signIn: async () => {},
    signOut: async () => {},
    sendVerificationRequest: async () => {},
    addImage: async () => {},
    addPage: async () => {},
    addUser: async () => {
      throw new Error("Not used in this test")
    },
    changeRole: async () => {},
    deleteImage: async () => {},
    deletePage: async () => {},
    deleteKV: async () => {},
    deleteUser: async () => {},
    getAllImages: async () => [],
    getAllPages: async () => [],
    getAllUsers: async () => [],
    getPageData: async () => null,
    getKV: async () => null,
    getSite: async () => undefined,
    putKV: async () => {},
    updatePageData: async () => {},
    updateSite: async () => {},
    createSession: async () => {
      throw new Error("Not used in this test")
    },
    createUser: async () => {
      throw new Error("Not used in this test")
    },
    createVerificationToken: async () => {
      throw new Error("Not used in this test")
    },
    deleteSession: async () => {},
    getSessionAndUser: async () => null,
    getUser: async () => null,
    getUserByAccount: async () => null,
    getUserByEmail: async () => null,
    linkAccount: async () => {
      throw new Error("Not used in this test")
    },
    unlinkAccount: async () => {},
    useVerificationToken: async () => null,
    updateSession: async () => {
      throw new Error("Not used in this test")
    },
    updateUser: async () => {
      throw new Error("Not used in this test")
    },
  }
}

async function closeDevelopmentClient() {
  const client = Reflect.get(globalThis, "oberonDb")

  if (
    client &&
    typeof client === "object" &&
    "close" in client &&
    typeof client.close === "function"
  ) {
    await client.close()
  }

  Reflect.deleteProperty(globalThis, "oberonDb")
}

describe(
  "development plugin key value store",
  { tags: ["ai", "issue-318"] },
  () => {
    const sqliteFile = resolve(
      rootDirectory,
      ".tmp/issue-318-development-plugin.db",
    )
    const sqliteUrl = `file:${sqliteFile}`

    beforeEach(async () => {
      await mkdir(dirname(sqliteFile), { recursive: true })
      await rm(sqliteFile, { force: true })
      await closeDevelopmentClient()
      vi.resetModules()
      process.env.SQLITE_FILE = sqliteUrl
      process.env.USE_DEVELOPMENT_DATABASE = "true"
      process.env.USE_DEVELOPMENT_SEND = "false"
    })

    afterEach(async () => {
      delete process.env.SQLITE_FILE
      delete process.env.USE_DEVELOPMENT_DATABASE
      delete process.env.USE_DEVELOPMENT_SEND
      await closeDevelopmentClient()
      await rm(sqliteFile, { force: true })
    })

    it("persists JSON values through prebuild-initialised sqlite storage", async () => {
      const { plugin } = await import("./index")

      const pluginInstance = plugin(createBaseAdapter())

      if (!pluginInstance.adapter) {
        throw new Error(
          "Development database adapter was not enabled for the test",
        )
      }

      const { adapter } = pluginInstance

      if (!adapter.putKV || !adapter.getKV) {
        throw new Error(
          "Development database adapter did not provide KV methods",
        )
      }

      await adapter.prebuild?.()
      await adapter.putKV("tailwind", "state", { activeHash: "abc123" })

      await expect(adapter.getKV("tailwind", "state")).resolves.toEqual({
        activeHash: "abc123",
      })
    })
  },
)
