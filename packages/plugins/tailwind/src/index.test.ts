import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { fromPartial, test } from "@dev/vitest"
import type { OberonAdapter, OberonPluginAdapter } from "@oberoncms/core"
import { NotImplementedError, ResponseError, type OberonFragment } from "@oberoncms/core"
import { createPluginTest, createStorageAdapterFactory } from "@oberoncms/testing"
import { z } from "zod"

import { name as pluginName } from "../package.json" with { type: "json" }
import { plugin as tailwindPlugin } from "./index"

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..")

const sqliteFile = resolve(rootDirectory, ".tmp/tailwind-plugin-unit-tests.db")

function createPage(className: string, key = "/"): OberonFragment {
  return {
    key,
    type: "page",
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedBy: "test@oberon.invalid",
    data: {
      content: [
        {
          type: "Text",
          props: {
            id: "text",
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

const tailwindStateSchema = z.object({
  activeHash: z.string().nullable(),
  classes: z.array(z.string()),
})

type TailwindState = z.infer<typeof tailwindStateSchema>

async function getState(adapter: Pick<OberonPluginAdapter, "getKV">) {
  const parsed = tailwindStateSchema.safeParse(
    await adapter.getKV({ namespace: pluginName, key: "state" }),
  )

  return parsed.success ? (parsed.data satisfies TailwindState) : null
}

async function getAsset(adapter: Pick<OberonPluginAdapter, "getKV">, hash: string) {
  return await adapter.getKV({ namespace: pluginName, key: `asset:${hash}` })
}

async function getStylesheets(adapter: Pick<OberonPluginAdapter, "getKV">) {
  const state = await getState(adapter)

  if (!state?.activeHash) {
    return []
  }

  const asset = await getAsset(adapter, state.activeHash)

  if (typeof asset !== "string") {
    return []
  }

  return [`/cms/api/tailwind/${state.activeHash}.css`]
}

const createAdapter = createStorageAdapterFactory({
  sqliteFile,
})

const asFinalAdapter = (adapter: OberonPluginAdapter) =>
  fromPartial<OberonAdapter>({
    ...adapter,
    getContentClasses: async () => [],
  })

const tailwindTest = createPluginTest(test)
  .extend(
    "adapter",
    { scope: "worker" },
    // oxlint-disable-next-line no-empty-pattern
    async ({}, { onCleanup }) => {
      return createAdapter(onCleanup)
    },
  )
  .extend("plugin", { scope: "worker" }, async ({ adapter }) => {
    return tailwindPlugin({ getAdapter: () => asFinalAdapter(adapter), phase: "runtime" })
  })

tailwindTest.describe("tailwind plugin", { tags: ["ai", "issue-314"] }, () => {
  tailwindTest.beforeEach(async ({ adapter }) => {
    const state = await getState(adapter)

    if (state?.activeHash) {
      await adapter.deleteKV({ namespace: pluginName, key: `asset:${state.activeHash}` })
    }

    await adapter.deleteKV({ namespace: pluginName, key: "state" })

    const pages = await adapter.getAllFragments({})

    for (const { key, type } of pages) {
      await adapter.deleteFragment({ key, type })
    }
  })

  tailwindTest(
    "keeps classes from both publications when an older stylesheet finishes last",
    async ({ adapter, plugin, expect }) => {
      const reachedWrite = Promise.withResolvers()
      const resumeWrite = Promise.withResolvers()
      const concurrentAdapter = asFinalAdapter({
        ...adapter,
        putKV: async (input) => {
          if (
            input.namespace === pluginName &&
            input.key === "state" &&
            tailwindStateSchema.parse(input.value).classes.join(" ") === "p-41"
          ) {
            reachedWrite.resolve(undefined)
            await resumeWrite.promise
          }
          await adapter.putKV(input)
        },
      })
      const hook = plugin.adapter?.updateFragmentData
      if (!hook) throw new Error("Missing Tailwind publication hook")
      const publish = hook({
        getAdapter: () => concurrentAdapter,
        next: adapter.updateFragmentData,
      })
      const first = publish(createPage("p-41", "/first"))
      await Promise.race([reachedWrite.promise, first])
      try {
        await publish(createPage("p-42", "/second"))
      } finally {
        resumeWrite.resolve(undefined)
      }
      await first
      expect((await getState(adapter))?.classes).toEqual(["p-41", "p-42"])
    },
  )

  tailwindTest(
    "includes Plugin-contributed classes in published styles",
    async ({ adapter, plugin, expect }) => {
      const hook = plugin.adapter?.updateFragmentData
      if (!hook) throw new Error("Missing Tailwind publication hook")
      await hook({
        getAdapter: () => ({
          ...asFinalAdapter(adapter),
          getContentClasses: async () => ["p-17", "md:p-19"],
        }),
        next: adapter.updateFragmentData,
      })(createPage("p-1"))
      expect((await getState(adapter))?.classes).toEqual(["md:p-19", "p-1", "p-17"])
    },
  )

  tailwindTest(
    "prepares source-only classes on creation and removes them after source deletion",
    async ({ adapter, plugin, expect }) => {
      const source = { ...createPage("p-7 underline", "shared:styles"), type: "shared" }
      await plugin.adapter?.addFragment?.({
        getAdapter: () => asFinalAdapter(adapter),
        next: adapter.addFragment,
      })(source)
      expect((await getState(adapter))?.classes).toContain("p-7")
      const hrefs = await getStylesheets(adapter)
      expect(hrefs).toHaveLength(1)

      await plugin.adapter?.deleteFragment?.({
        getAdapter: () => asFinalAdapter(adapter),
        next: adapter.deleteFragment,
      })({ key: source.key, type: source.type })
      expect((await getState(adapter))?.classes).not.toContain("p-7")
      await expect(getStylesheets(adapter)).resolves.toEqual([])
    },
  )

  tailwindTest(
    "keeps previous stylesheet URLs available after styles change or are cleared",
    async ({ expect, adapter, plugin }) => {
      const publish = plugin.adapter!.updateFragmentData!({
        getAdapter: () => asFinalAdapter(adapter),
        next: adapter.updateFragmentData,
      })
      await publish(createPage("underline"))
      const [firstHref] = await getStylesheets(adapter)

      await publish(createPage("text-red-500"))
      const [secondHref] = await getStylesheets(adapter)
      expect(secondHref).not.toBe(firstHref)

      await publish(createPage(""))
      await expect(getStylesheets(adapter)).resolves.toEqual([])

      const handler = plugin.handlers!.tailwind!(asFinalAdapter(adapter))
      for (const [href, css] of [
        [firstHref, ".underline"],
        [secondHref, ".text-red-500"],
      ]) {
        const response = await handler.GET!(new Request(`https://oberon.invalid${href}`))
        expect(response.status).toBe(200)
        expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable")
        await expect(response.text()).resolves.toContain(css)
      }
    },
  )

  tailwindTest(
    "publishes a hashed dynamic asset and exposes its stylesheet href",
    async ({ expect, adapter, plugin }) => {
      const page = createPage("text-red-500 md:grid text-red-500")

      await plugin.adapter?.updateFragmentData?.({
        getAdapter: () => asFinalAdapter(adapter),
        next: adapter.updateFragmentData,
      })(page)

      const state = await getState(adapter)

      expect(state?.classes).toEqual(["md:grid", "text-red-500"])
      expect(state?.activeHash).toHaveLength(64)
      await expect(getAsset(adapter, state!.activeHash!)).resolves.toContain(".text-red-500")

      await expect(getStylesheets(adapter)).resolves.toEqual([
        `/cms/api/tailwind/${state!.activeHash}.css`,
      ])

      const response = await plugin.handlers
        ?.tailwind?.(fromPartial<OberonAdapter>(adapter))
        .GET?.(new Request(`https://oberon.invalid/cms/api/tailwind/${state!.activeHash}.css`))

      expect(response?.status).toBe(200)
      await expect(response?.text()).resolves.toContain(".md\\:grid")
    },
  )

  tailwindTest(
    "publishes the playground text example classes without throwing",
    async ({ expect, adapter, plugin }) => {
      const page = createPage("prose dark:prose-invert lg:prose-lg p-1")

      await expect(
        plugin.adapter?.updateFragmentData?.({
          getAdapter: () => asFinalAdapter(adapter),
          next: adapter.updateFragmentData,
        })(page),
      ).resolves.toBeUndefined()

      const state = await getState(adapter)

      expect(state?.classes).toEqual(["dark:prose-invert", "lg:prose-lg", "p-1", "prose"])
      expect(state?.activeHash).toHaveLength(64)
    },
  )

  tailwindTest(
    "reconciles missing assets during bootstrap",
    async ({ expect, adapter, plugin }) => {
      const page = createPage("underline")
      await plugin.adapter?.updateFragmentData?.({
        getAdapter: () => asFinalAdapter(adapter),
        next: adapter.updateFragmentData,
      })(page)

      await plugin.bootstrap?.()

      const firstState = await getState(adapter)

      await adapter.deleteKV({ namespace: pluginName, key: `asset:${firstState!.activeHash}` })

      await expect(getStylesheets(adapter)).resolves.toEqual([])

      await plugin.bootstrap?.()

      await expect(getAsset(adapter, firstState!.activeHash!)).resolves.toContain(".underline")
    },
  )

  tailwindTest(
    "degrades when no dynamic asset is available",
    async ({ expect, adapter, plugin }) => {
      await expect(getStylesheets(adapter)).resolves.toEqual([])

      const response = await plugin.handlers
        ?.tailwind?.(fromPartial<OberonAdapter>(adapter))
        .GET?.(new Request("https://oberon.invalid/cms/api/tailwind"))

      expect(response?.status).toBe(404)
    },
  )

  tailwindTest(
    "fails loudly during bootstrap when KV storage is unavailable",
    async ({ expect }) => {
      const adapter = fromPartial<OberonAdapter>({
        getFragmentRevision: async () => "revision",
        getContentClasses: async () => [],
        getAllFragments: async () => [{ key: "/" }],
        getFragmentData: async () => createPage("underline").data,
        getKV: async () => {
          throw new NotImplementedError("This action is not available in the demo")
        },
        putKV: async () => {
          throw new NotImplementedError("This action is not available in the demo")
        },
      })
      const plugin = tailwindPlugin({ getAdapter: () => adapter, phase: "bootstrap" })

      await expect(plugin.bootstrap?.()).rejects.toThrow(
        new NotImplementedError("This action is not available in the demo"),
      )

      const response = await plugin.handlers
        ?.tailwind?.(adapter)
        .GET?.(new Request("https://oberon.invalid/cms/api/tailwind"))

      expect(response?.status).toBe(404)
    },
  )

  tailwindTest(
    "fails loudly during page updates when KV storage is unavailable",
    async ({ expect }) => {
      const adapter = fromPartial<OberonAdapter>({
        getFragmentRevision: async () => "revision",
        getContentClasses: async () => [],
        updateFragmentData: async () => {},
        getAllFragments: async () => [{ key: "/" }],
        getFragmentData: async () => createPage("underline").data,
        getKV: async () => {
          throw new NotImplementedError("This action is not available in the demo")
        },
        putKV: async () => {
          throw new NotImplementedError("This action is not available in the demo")
        },
      })
      const plugin = tailwindPlugin({ getAdapter: () => adapter, phase: "runtime" })
      const page = createPage("underline")

      await expect(
        plugin.adapter?.updateFragmentData?.({
          getAdapter: () => asFinalAdapter(adapter),
          next: adapter.updateFragmentData,
        })(page),
      ).rejects.toThrow(new NotImplementedError("This action is not available in the demo"))

      const response = await plugin.handlers
        ?.tailwind?.(adapter)
        .GET?.(new Request("https://oberon.invalid/cms/api/tailwind"))

      expect(response?.status).toBe(404)
    },
  )

  tailwindTest(
    "surfaces generic Tailwind update failures as response errors",
    async ({ expect }) => {
      const adapter = fromPartial<OberonAdapter>({
        getFragmentRevision: async () => "revision",
        getContentClasses: async () => [],
        updateFragmentData: async () => {},
        getAllFragments: async () => [{ key: "/" }],
        getFragmentData: async () => createPage("underline").data,
        getKV: async () => null,
        putKV: async () => {
          throw new Error("boom")
        },
      })
      const plugin = tailwindPlugin({ getAdapter: () => adapter, phase: "runtime" })
      const page = createPage("underline")

      await expect(
        plugin.adapter?.updateFragmentData?.({
          getAdapter: () => adapter,
          next: adapter.updateFragmentData,
        })(page),
      ).rejects.toThrow(new ResponseError("Failed to update Tailwind styles: boom"))
    },
  )
})
