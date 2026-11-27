import { resolve } from "path"

import { fromPartial, test } from "@dev/vitest"
import type { OberonAdapter, OberonClientConfig, OberonPluginAdapter } from "@oberoncms/core"
import { NotImplementedError, ResponseError, type OberonComponentRecord } from "@oberoncms/core"
import { createPluginTest, createStorageAdapterFactory } from "@oberoncms/testing"
import { createElement } from "react"
import { z } from "zod"

import { name as pluginName } from "../package.json" with { type: "json" }
import { plugin as tailwindPlugin } from "./index"

const rootDirectory = resolve(import.meta.dirname, "../../../..")

const sqliteFile = resolve(rootDirectory, ".tmp/tailwind-plugin-unit-tests.db")

function createPage(className: string, key = "/"): OberonComponentRecord {
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

const client: OberonClientConfig = {
  version: 1,
  components: {
    Container: { render: () => createElement("div"), fields: { content: { type: "slot" } } },
    Text: { render: () => createElement("div"), fields: { className: { type: "text" } } },
  },
}

const asFinalAdapter = (adapter: OberonPluginAdapter) => fromPartial<OberonAdapter>(adapter)

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
    return tailwindPlugin({ client, getAdapter: () => asFinalAdapter(adapter), phase: "runtime" })
  })

tailwindTest.describe("tailwind plugin", { tags: ["ai", "issue-314"] }, () => {
  tailwindTest.beforeEach(async ({ adapter }) => {
    const state = await getState(adapter)

    if (state?.activeHash) {
      await adapter.deleteKV({ namespace: pluginName, key: `asset:${state.activeHash}` })
    }

    await adapter.deleteKV({ namespace: pluginName, key: "state" })

    const components = [
      ...(await adapter.listComponents("page")),
      ...(await adapter.listComponents("shared")),
    ]

    for (const { key, type } of components) {
      await adapter.deleteComponent({ key, type })
    }
  })

  tailwindTest(
    "keeps previous stylesheet URLs available after styles change or are cleared",
    async ({ expect, adapter, plugin }) => {
      const publish = async (page: OberonComponentRecord) => {
        await adapter.updateComponentData(page)
        await plugin.adapter?.onComponentWrite?.({
          getAdapter: () => asFinalAdapter(adapter),
          next: async () => {},
        })()
      }
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

      await adapter.updateComponentData(page)
      await plugin.adapter?.onComponentWrite?.({
        getAdapter: () => asFinalAdapter(adapter),
        next: async () => {},
      })()

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

      await adapter.updateComponentData(page)
      await expect(
        plugin.adapter?.onComponentWrite?.({
          getAdapter: () => asFinalAdapter(adapter),
          next: async () => {},
        })(),
      ).resolves.toBeUndefined()

      const state = await getState(adapter)

      expect(state?.classes).toEqual(["dark:prose-invert", "lg:prose-lg", "p-1", "prose"])
      expect(state?.activeHash).toHaveLength(64)
    },
  )

  tailwindTest(
    "includes classes from Exposed props, explicit defaults and instance-owned content",
    async ({ expect, adapter, plugin }) => {
      const key = "instance_20e9cce7_1189_4dd3_9319_59873d8f57bb"
      const body = "instance_03208b10_e560_434f_86e1_c2a4bb051a25"
      const updatedAt = new Date()
      const source = {
        key: "banner",
        type: "shared" as const,
        updatedAt,
        updatedBy: "test",
        data: {
          name: "Banner",
          tree: {
            root: {},
            content: [
              { type: "Text", props: { id: "banner-text" } },
              { type: "Container", props: { id: "banner-body", content: [] } },
            ],
          },
          exposures: [
            { key, label: "Style", nodeId: "banner-text", prop: "className" },
            { key: body, label: "Body", nodeId: "banner-body", prop: "content" },
          ],
          defaults: { [key]: "italic" },
        },
      }
      const page = {
        key: "/",
        type: "page" as const,
        updatedAt,
        updatedBy: "test",
        data: {
          root: {},
          content: [
            {
              type: "SharedComponent",
              props: {
                id: "instance",
                sharedComponentKey: "banner",
                [key]: "underline",
                [body]: [{ type: "Text", props: { id: "owned-text", className: "font-bold" } }],
              },
            },
          ],
        },
      }
      await adapter.addComponent(source)
      await adapter.addComponent(page)
      await plugin.adapter?.onComponentWrite?.({
        getAdapter: () => asFinalAdapter(adapter),
        next: async () => {},
      })()
      const state = await getState(adapter)
      expect(state?.classes).toEqual(["font-bold", "italic", "underline"])
      await expect(getAsset(adapter, state?.activeHash ?? "")).resolves.toContain(".font-bold")
    },
  )

  tailwindTest(
    "reconciles missing assets during bootstrap",
    async ({ expect, adapter, plugin }) => {
      const page = createPage("underline")
      await adapter.updateComponentData(page)
      await plugin.adapter?.onComponentWrite?.({
        getAdapter: () => asFinalAdapter(adapter),
        next: async () => {},
      })()

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
        listComponents: async () => [
          { key: "/", type: "page", updatedAt: new Date(), updatedBy: "test" },
        ],
        getComponent: async () => createPage("underline"),
        getKV: async () => {
          throw new NotImplementedError("This action is not available in the demo")
        },
        putKV: async () => {
          throw new NotImplementedError("This action is not available in the demo")
        },
      })
      const plugin = tailwindPlugin({ client, getAdapter: () => adapter, phase: "bootstrap" })

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
        onComponentWrite: async () => {},
        listComponents: async () => [
          { key: "/", type: "page", updatedAt: new Date(), updatedBy: "test" },
        ],
        getComponent: async () => createPage("underline"),
        getKV: async () => {
          throw new NotImplementedError("This action is not available in the demo")
        },
        putKV: async () => {
          throw new NotImplementedError("This action is not available in the demo")
        },
      })
      const plugin = tailwindPlugin({ client, getAdapter: () => adapter, phase: "runtime" })
      await expect(
        plugin.adapter?.onComponentWrite?.({
          getAdapter: () => asFinalAdapter(adapter),
          next: adapter.onComponentWrite,
        })(),
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
        onComponentWrite: async () => {},
        listComponents: async () => [
          { key: "/", type: "page", updatedAt: new Date(), updatedBy: "test" },
        ],
        getComponent: async () => createPage("underline"),
        getKV: async () => null,
        putKV: async () => {
          throw new Error("boom")
        },
      })
      const plugin = tailwindPlugin({ client, getAdapter: () => adapter, phase: "runtime" })
      await expect(
        plugin.adapter?.onComponentWrite?.({
          getAdapter: () => adapter,
          next: adapter.onComponentWrite,
        })(),
      ).rejects.toThrow(new ResponseError("Failed to update Tailwind styles: boom"))
    },
  )
})
