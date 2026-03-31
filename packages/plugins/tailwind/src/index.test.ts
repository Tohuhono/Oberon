import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { fromPartial, test } from "@dev/vitest"
import { NotImplementedError, type OberonPage } from "@oberoncms/core"
import { createPluginTest } from "@oberoncms/testing"
import { createSqliteAdapterFactory } from "@oberoncms/testing/sqlite"
import { getAdapter } from "@oberoncms/sqlite/adapter"
import * as schema from "@oberoncms/sqlite/schema"
import { name as pluginName } from "../package.json" with { type: "json" }
import { getTailwindAssetKey, plugin as tailwindPlugin } from "./index"

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
)

const sqliteFile = resolve(rootDirectory, ".tmp/tailwind-plugin-unit-tests.db")
const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../oberoncms/sqlite/src/db/migrations",
)

function createPage(className: string, key = "/"): OberonPage {
  return {
    key,
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedBy: "test@oberon.invalid",
    data: {
      content: [
        {
          type: "Text",
          props: {
            className,
          },
        },
      ],
      root: {
        props: {
          title: "Test",
        },
      },
    },
  }
}

async function getState(adapter: {
  getKV: (namespace: string, key: string) => Promise<unknown>
}) {
  return (await adapter.getKV(pluginName, "state")) as {
    activeHash: string | null
    classes: string[]
  } | null
}

async function getAsset(
  adapter: { getKV: (namespace: string, key: string) => Promise<unknown> },
  hash: string,
) {
  return await adapter.getKV(pluginName, getTailwindAssetKey(hash))
}

async function getStylesheets(adapter: {
  getKV: (namespace: string, key: string) => Promise<unknown>
}) {
  const state = await getState(adapter)

  if (!state?.activeHash) {
    return []
  }

  const asset = await getAsset(adapter, state.activeHash)

  if (typeof asset !== "string") {
    return []
  }

  return [`/cms/api/tailwind?hash=${state.activeHash}`]
}

const createAdapter = createSqliteAdapterFactory({
  sqliteFile,
  schema,
  migrationsFolder,
  getAdapter: (db) => getAdapter(() => db),
})

const tailwindTest = createPluginTest(test)
  .extend(
    "adapter",
    { scope: "worker" },
    // eslint-disable-next-line no-empty-pattern
    async ({}, { onCleanup }) => {
      return await createAdapter(onCleanup)
    },
  )
  .extend("plugin", { scope: "worker" }, async ({ adapter }) => {
    return tailwindPlugin(adapter)
  })

tailwindTest.describe("tailwind plugin", { tags: ["ai", "issue-314"] }, () => {
  tailwindTest.beforeEach(async ({ adapter }) => {
    const state = await getState(adapter)

    if (state?.activeHash) {
      await adapter.deleteKV(pluginName, getTailwindAssetKey(state.activeHash))
    }

    await adapter.deleteKV(pluginName, "state")

    const pages = await adapter.getAllPages()

    for (const { key } of pages) {
      await adapter.deletePage(key)
    }
  })

  tailwindTest(
    "publishes a hashed dynamic asset and exposes its stylesheet href",
    async ({ expect, adapter, plugin }) => {
      const page = createPage("text-red-500 md:grid text-red-500")

      await plugin.adapter?.updatePageData?.(page)

      const state = await getState(adapter)

      expect(state?.classes).toEqual(["md:grid", "text-red-500"])
      expect(state?.activeHash).toHaveLength(64)
      await expect(getAsset(adapter, state!.activeHash!)).resolves.toContain(
        ".text-red-500",
      )

      await expect(getStylesheets(adapter)).resolves.toEqual([
        `/cms/api/tailwind?hash=${state!.activeHash}`,
      ])

      const response = await plugin.handlers
        ?.tailwind?.(fromPartial({}))
        .GET?.(
          new Request(
            `https://oberon.invalid/cms/api/tailwind?hash=${state!.activeHash}`,
          ) as never,
        )

      expect(response?.status).toBe(200)
      await expect(response?.text()).resolves.toContain(".md\\:grid")
    },
  )

  tailwindTest(
    "reconciles missing assets during prebuild",
    async ({ expect, adapter, plugin }) => {
      await plugin.adapter?.updatePageData?.(createPage("underline"))

      await plugin.adapter?.prebuild?.()

      const firstState = await getState(adapter)

      await adapter.deleteKV(
        pluginName,
        getTailwindAssetKey(firstState!.activeHash!),
      )

      await expect(getStylesheets(adapter)).resolves.toEqual([])

      await plugin.adapter?.prebuild?.()

      await expect(
        getAsset(adapter, firstState!.activeHash!),
      ).resolves.toContain(".underline")
    },
  )

  tailwindTest(
    "degrades when no dynamic asset is available",
    async ({ expect, adapter, plugin }) => {
      await expect(getStylesheets(adapter)).resolves.toEqual([])

      const response = await plugin.handlers
        ?.tailwind?.(fromPartial({}))
        .GET?.(new Request("https://oberon.invalid/cms/api/tailwind") as never)

      expect(response?.status).toBe(404)
    },
  )

  tailwindTest(
    "fails loudly during prebuild when KV storage is unavailable",
    async ({ expect }) => {
      const plugin = tailwindPlugin(
        fromPartial({
          prebuild: async () => {},
          getAllPages: async () => [{ key: "/" }],
          getPageData: async () => createPage("underline").data,
          getKV: async () => {
            throw new NotImplementedError(
              "This action is not available in the demo",
            )
          },
          putKV: async () => {
            throw new NotImplementedError(
              "This action is not available in the demo",
            )
          },
        }),
      )

      await expect(plugin.adapter?.prebuild?.()).rejects.toThrow(
        new NotImplementedError("This action is not available in the demo"),
      )

      const response = await plugin.handlers
        ?.tailwind?.(fromPartial({}))
        .GET?.(new Request("https://oberon.invalid/cms/api/tailwind") as never)

      expect(response?.status).toBe(404)
    },
  )

  tailwindTest(
    "fails loudly during page updates when KV storage is unavailable",
    async ({ expect }) => {
      const plugin = tailwindPlugin(
        fromPartial({
          updatePageData: async () => {},
          getAllPages: async () => [{ key: "/" }],
          getPageData: async () => createPage("underline").data,
          getKV: async () => {
            throw new NotImplementedError(
              "This action is not available in the demo",
            )
          },
          putKV: async () => {
            throw new NotImplementedError(
              "This action is not available in the demo",
            )
          },
        }),
      )

      await expect(
        plugin.adapter?.updatePageData?.(createPage("underline")),
      ).rejects.toThrow(
        new NotImplementedError("This action is not available in the demo"),
      )

      const response = await plugin.handlers
        ?.tailwind?.(fromPartial({}))
        .GET?.(new Request("https://oberon.invalid/cms/api/tailwind") as never)

      expect(response?.status).toBe(404)
    },
  )
})
