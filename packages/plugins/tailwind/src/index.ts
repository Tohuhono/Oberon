import "server-cli-only"

import { createHash } from "crypto"
import {
  type OberonPlugin,
  type OberonPluginAdapter,
  ResponseError,
} from "@oberoncms/core"
import { walkAsyncStep } from "walkjs"
import { z } from "zod"
import { name, version } from "../package.json" with { type: "json" }
import { buildCss } from "./compiler"

const tailwindStateSchema = z.object({
  activeHash: z.string().nullable(),
  classes: z.array(z.string()),
})

const classDelimiter = /\s+/

export async function extractTailwindClasses(data: unknown) {
  const classes = new Set<string>()

  for await (const node of walkAsyncStep(data)) {
    if (node.key !== "className" || typeof node.val !== "string") {
      continue
    }

    for (const cls of node.val.split(classDelimiter)) {
      if (cls) classes.add(cls)
    }
  }

  return [...classes].sort()
}

async function getState(adapter: Pick<OberonPluginAdapter, "getKV">) {
  const parsed = tailwindStateSchema.safeParse(
    await adapter.getKV(name, "state"),
  )

  return parsed.success ? parsed.data : { activeHash: null, classes: [] }
}

async function getAsset(
  adapter: Pick<OberonPluginAdapter, "getKV">,
  hash: string | null | undefined,
) {
  if (!hash) {
    return null
  }

  const asset = await adapter.getKV(name, `asset:${hash}`)

  return typeof asset === "string" ? asset : null
}

async function getAllPublishedClasses(
  adapter: Pick<OberonPluginAdapter, "getAllPages" | "getPageData">,
) {
  const classes = new Set<string>()
  const pages = await adapter.getAllPages()

  for (const { key } of pages) {
    const data = await adapter.getPageData(key)
    if (!data) continue

    for await (const node of walkAsyncStep(data)) {
      if (node.key !== "className" || typeof node.val !== "string") {
        continue
      }

      for (const cls of node.val.split(classDelimiter)) {
        if (cls) classes.add(cls)
      }
    }
  }

  return [...classes].sort()
}

async function syncStyles(
  adapter: Pick<
    OberonPluginAdapter,
    "getAllPages" | "getKV" | "getPageData" | "putKV"
  >,
) {
  const classes = await getAllPublishedClasses(adapter)
  const state = await getState(adapter)

  if (!classes.length) {
    if (state.activeHash === null && state.classes.length === 0) {
      return
    }

    await adapter.putKV(name, "state", { activeHash: null, classes: [] })
    return
  }

  const hash = createHash("sha256").update(classes.join("\n")).digest("hex")

  if (hash === state.activeHash && (await getAsset(adapter, hash))) {
    return
  }

  const css = await buildCss(classes)
  await adapter.putKV(name, `asset:${hash}`, css)

  await adapter.putKV(name, "state", { activeHash: hash, classes })
}

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  handlers: {
    tailwind: () => ({
      GET: async (request) => {
        try {
          const pathname = new URL(request.url).pathname
          const filename = pathname.split("/").pop()
          const hash = filename?.endsWith(".css")
            ? filename.slice(0, -4)
            : undefined
          const css = await getAsset(adapter, hash)

          if (!css) {
            return new Response("", {
              status: 404,
              headers: {
                "Cache-Control": "no-store",
                "Content-Type": "text/css; charset=utf-8",
              },
            })
          }

          return new Response(css, {
            status: 200,
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
              "Content-Type": "text/css; charset=utf-8",
            },
          })
        } catch {
          return new Response("", {
            status: 404,
            headers: {
              "Cache-Control": "no-store",
              "Content-Type": "text/css; charset=utf-8",
            },
          })
        }
      },
    }),
  },
  adapter: {
    prebuild: async () => {
      try {
        await adapter.prebuild()
        await syncStyles(adapter)
      } catch (error) {
        if (error instanceof ResponseError) {
          throw error
        }

        throw new ResponseError(
          error instanceof Error && error.message
            ? `Failed to prepare Tailwind styles: ${error.message}`
            : "Failed to prepare Tailwind styles",
        )
      }
    },
    updatePageData: async (page) => {
      try {
        await adapter.updatePageData(page)
        await syncStyles(adapter)
      } catch (error) {
        if (error instanceof ResponseError) {
          throw error
        }

        throw new ResponseError(
          error instanceof Error && error.message
            ? `Failed to update Tailwind styles: ${error.message}`
            : "Failed to update Tailwind styles",
        )
      }
    },
  },
})
