import "server-cli-only"
import { createHash } from "crypto"

import {
  getFragmentStyleProps,
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
  adapter: Pick<OberonPluginAdapter, "getAllFragments" | "getFragmentData">,
  client: OberonClientConfig,
) {
  const [pages, shared] = await Promise.all([
    adapter.getAllFragments("page"),
    adapter.getAllFragments("shared"),
  ])
  const fragments = await Promise.all(
    [...pages, ...shared].map(({ key }) => adapter.getFragmentData({ key })),
  )
  const { props, exposedClassKeys } = getFragmentStyleProps(
    fragments.filter((fragment) => fragment !== null),
    client,
  )
  return extractTailwindClasses(props, exposedClassKeys)
}

async function syncStyles(
  adapter: Pick<OberonPluginAdapter, "getAllFragments" | "getKV" | "getFragmentData" | "putKV">,
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
    onFragmentWrite:
      ({ getAdapter, next }) =>
      async () => {
        await next()
        await syncAfterWrite(getAdapter(), client)
      },
  },
})

async function syncAfterWrite(
  adapter: Pick<OberonPluginAdapter, "getAllFragments" | "getFragmentData" | "getKV" | "putKV">,
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
