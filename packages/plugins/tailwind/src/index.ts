import "server-cli-only"
import { createHash } from "crypto"

import { type OberonPlugin, type OberonPluginAdapter, ResponseError } from "@oberoncms/core"
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
  adapter: Pick<OberonPluginAdapter, "getAllFragments" | "getFragmentData" | "getContentClasses">,
) {
  const fragments = await adapter.getAllFragments({})
  const data = (
    await Promise.all(fragments.map(({ key }) => adapter.getFragmentData({ key })))
  ).filter((fragment) => fragment !== null)
  return [
    ...new Set([
      ...(await extractTailwindClasses(data)),
      ...(await adapter.getContentClasses({ fragments: data })),
    ]),
  ].sort()
}

async function syncStyles(
  adapter: Pick<
    OberonPluginAdapter,
    | "getAllFragments"
    | "getKV"
    | "getFragmentData"
    | "getContentClasses"
    | "getFragmentRevision"
    | "putKV"
  >,
  operation: "prepare" | "update" = "update",
) {
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const revision = await adapter.getFragmentRevision()
      try {
        const classes = await getAllPublishedClasses(adapter)
        const state = await getState(adapter)
        if (!classes.length) {
          if (state.activeHash !== null || state.classes.length !== 0) {
            await adapter.putKV({
              namespace: name,
              key: "state",
              value: { activeHash: null, classes: [] },
            })
          }
        } else if (
          classes.join("\n") !== state.classes.join("\n") ||
          !(await getAsset(adapter, state.activeHash))
        ) {
          const css = await buildCss(classes)
          const hash = createHash("sha256").update(css).digest("hex")
          await adapter.putKV({ namespace: name, key: `asset:${hash}`, value: css })
          await adapter.putKV({
            namespace: name,
            key: "state",
            value: { activeHash: hash, classes },
          })
        }
        if ((await adapter.getFragmentRevision()) === revision) return
      } catch (error) {
        if ((await adapter.getFragmentRevision()) === revision) throw error
      }
    }
    throw new ResponseError(
      "Published content kept changing while preparing Tailwind styles. Try publishing again.",
    )
  } catch (error) {
    if (error instanceof ResponseError) throw error
    throw new ResponseError(
      error instanceof Error && error.message
        ? `Failed to ${operation} Tailwind styles: ${error.message}`
        : `Failed to ${operation} Tailwind styles`,
    )
  }
}

export const plugin: OberonPlugin = ({ getAdapter: getBootstrapAdapter }) => ({
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
  bootstrap: async () => syncStyles(getBootstrapAdapter(), "prepare"),
  adapter: {
    addFragment:
      ({ getAdapter, next }) =>
      async (fragment) => {
        await next(fragment)
        await syncStyles(getAdapter())
      },
    updateFragmentData:
      ({ getAdapter, next }) =>
      async (fragment) => {
        await next(fragment)
        await syncStyles(getAdapter())
      },
    deleteFragment:
      ({ getAdapter, next }) =>
      async (fragment) => {
        await next(fragment)
        await syncStyles(getAdapter())
      },
  },
})
