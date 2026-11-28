import "server-cli-only"
import { createHash } from "crypto"

import {
  createComponentStyleReader,
  getSharedComponentRecords,
  type OberonComponentRecord,
  type OberonClientConfig,
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

const classDelimiter = /\s+/u

export async function extractTailwindClasses(data: unknown, exposedClassKeys = new Set<string>()) {
  const classes = new Set<string>()

  for await (const node of walkAsyncStep(data)) {
    if (
      typeof node.val !== "string" ||
      (node.key !== "className" && !exposedClassKeys.has(String(node.key)))
    ) {
      continue
    }

    for (const cls of node.val.split(classDelimiter)) {
      if (cls) classes.add(cls)
    }
  }

  return Array.from(classes).sort()
}

async function getState(adapter: Pick<OberonPluginAdapter, "getKV">) {
  const parsed = tailwindStateSchema.safeParse(
    await adapter.getKV({ namespace: name, key: "state" }),
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

  const asset = await adapter.getKV({ namespace: name, key: `asset:${hash}` })

  return typeof asset === "string" ? asset : null
}

async function getAllPublishedClasses(
  adapter: Pick<OberonPluginAdapter, "listComponents" | "getComponent">,
  client: OberonClientConfig,
) {
  const shared = await getSharedComponentRecords(adapter)
  const { readProps, exposedClassKeys } = createComponentStyleReader(shared, client)
  const classes = new Set<string>()
  const addClasses = async (component: OberonComponentRecord) => {
    for (const className of await extractTailwindClasses(readProps(component), exposedClassKeys)) {
      classes.add(className)
    }
  }

  for (const component of shared) await addClasses(component)
  for (const { key } of await adapter.listComponents("page")) {
    const component = await adapter.getComponent({ key })
    if (component?.type === "page") await addClasses(component)
  }

  return [...classes].sort()
}

async function syncStyles(
  adapter: Pick<OberonPluginAdapter, "listComponents" | "getKV" | "getComponent" | "putKV">,
  client: OberonClientConfig,
) {
  const classes = await getAllPublishedClasses(adapter, client)
  const state = await getState(adapter)

  if (!classes.length) {
    if (state.activeHash === null && state.classes.length === 0) {
      return
    }

    await adapter.putKV({ namespace: name, key: "state", value: { activeHash: null, classes: [] } })
    return
  }

  if (
    classes.join("\n") === state.classes.join("\n") &&
    (await getAsset(adapter, state.activeHash))
  ) {
    return
  }

  const css = await buildCss(classes)
  const hash = createHash("sha256").update(css).digest("hex")
  await adapter.putKV({ namespace: name, key: `asset:${hash}`, value: css })

  await adapter.putKV({ namespace: name, key: "state", value: { activeHash: hash, classes } })
}

export const plugin: OberonPlugin = ({ client, getAdapter: getBootstrapAdapter }) => ({
  name,
  version,
  handlers: {
    tailwind: (adapter) => ({
      GET: async (request) => {
        try {
          const pathname = new URL(request.url).pathname
          const filename = pathname.split("/").pop()
          const hash = filename?.endsWith(".css") ? filename.slice(0, -4) : undefined
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
  bootstrap: async () => {
    try {
      await syncStyles(getBootstrapAdapter(), client)
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
  adapter: {
    onComponentWrite:
      ({ getAdapter, next }) =>
      async () => {
        await next()
        await syncAfterWrite(getAdapter(), client)
      },
  },
})

async function syncAfterWrite(
  adapter: Pick<OberonPluginAdapter, "listComponents" | "getComponent" | "getKV" | "putKV">,
  client: OberonClientConfig,
) {
  try {
    await syncStyles(adapter, client)
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
}
