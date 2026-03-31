import "server-cli-only"

import { createHash } from "crypto"
import {
  NotImplementedError,
  type JsonValue,
  type OberonPage,
  type OberonPlugin,
  type OberonPluginAdapter,
} from "@oberoncms/core"
import { walkAsyncStep } from "walkjs"
import { name, version } from "../package.json" with { type: "json" }

type TailwindState = {
  activeHash: string | null
  classes: string[]
}

const namespace = name
const stateKey = "state"
const tailwindEntry = [
  '@import "tailwindcss/theme" theme(reference);',
  '@import "tailwindcss/utilities";',
].join("\n")

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  )
}

function isTailwindState(value: JsonValue | null): value is TailwindState {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "activeHash" in value &&
    (typeof value.activeHash === "string" || value.activeHash === null) &&
    "classes" in value &&
    isStringArray(value.classes)
  )
}

function splitClasses(value: string) {
  return value.split(/\s+/).filter(Boolean)
}

function uniqueClasses(values: Iterable<string>) {
  return [...new Set(values)].sort()
}

export function getTailwindAssetKey(hash: string) {
  return `asset:${hash}`
}

function isUnavailable(error: unknown) {
  return error instanceof NotImplementedError
}

export async function extractTailwindClasses(data: unknown) {
  const classes: string[] = []

  for await (const node of walkAsyncStep(data)) {
    if (node.key !== "className" || typeof node.val !== "string") {
      continue
    }

    classes.push(...splitClasses(node.val))
  }

  return uniqueClasses(classes)
}

async function getState(adapter: Pick<OberonPluginAdapter, "getKV">) {
  const value = await adapter.getKV(namespace, stateKey)

  if (!isTailwindState(value)) {
    return {
      activeHash: null,
      classes: [],
    } satisfies TailwindState
  }

  return {
    activeHash: value.activeHash,
    classes: uniqueClasses(value.classes),
  } satisfies TailwindState
}

async function getAsset(
  adapter: Pick<OberonPluginAdapter, "getKV">,
  hash: string,
) {
  const asset = await adapter.getKV(namespace, getTailwindAssetKey(hash))

  return typeof asset === "string" ? asset : null
}

async function getOptionalState(adapter: Pick<OberonPluginAdapter, "getKV">) {
  try {
    return await getState(adapter)
  } catch (error) {
    if (isUnavailable(error)) {
      return null
    }

    throw error
  }
}

async function getOptionalAsset(
  adapter: Pick<OberonPluginAdapter, "getKV">,
  hash: string,
) {
  try {
    return await getAsset(adapter, hash)
  } catch (error) {
    if (isUnavailable(error)) {
      return null
    }

    throw error
  }
}

async function buildCss(classes: string[]) {
  const extension = import.meta.url.endsWith(".ts") ? "ts" : "js"
  const moduleUrl = new URL(`./compiler.${extension}`, import.meta.url)
  const { buildCss } = await import(moduleUrl.href)

  return buildCss(tailwindEntry, classes)
}

function getHash(classes: string[]) {
  return createHash("sha256").update(classes.join("\n")).digest("hex")
}

async function getAllPublishedClasses(
  adapter: Pick<OberonPluginAdapter, "getAllPages" | "getPageData">,
  pageOverride?: Pick<OberonPage, "key" | "data">,
) {
  const pages = await adapter.getAllPages()
  const classes = new Set<string>()
  let hasOverride = false

  for (const { key } of pages) {
    const data =
      pageOverride && pageOverride.key === key
        ? ((hasOverride = true), pageOverride.data)
        : await adapter.getPageData(key)

    if (!data) {
      continue
    }

    for (const className of await extractTailwindClasses(data)) {
      classes.add(className)
    }
  }

  if (pageOverride && !hasOverride) {
    for (const className of await extractTailwindClasses(pageOverride.data)) {
      classes.add(className)
    }
  }

  return [...classes].sort()
}

async function persistState(
  adapter: Pick<OberonPluginAdapter, "putKV">,
  classes: string[],
  hash: string | null,
  css: string | null,
) {
  if (hash && css) {
    await adapter.putKV(namespace, getTailwindAssetKey(hash), css)
  }

  await adapter.putKV(namespace, stateKey, {
    activeHash: hash,
    classes,
  })
}

async function reconcileTailwindState(
  adapter: Pick<
    OberonPluginAdapter,
    "getAllPages" | "getKV" | "getPageData" | "putKV"
  >,
  pageOverride?: Pick<OberonPage, "key" | "data">,
) {
  const classes = await getAllPublishedClasses(adapter, pageOverride)
  const state = await getState(adapter)

  if (!classes.length) {
    if (!state.classes.length && state.activeHash === null) {
      return state
    }

    await persistState(adapter, [], null, null)

    return {
      activeHash: null,
      classes: [],
    } satisfies TailwindState
  }

  const hash = getHash(classes)

  if (
    hash === state.activeHash &&
    classes.join("\n") === state.classes.join("\n") &&
    (await getAsset(adapter, hash))
  ) {
    return {
      activeHash: hash,
      classes,
    } satisfies TailwindState
  }

  await persistState(adapter, classes, hash, await buildCss(classes))

  return {
    activeHash: hash,
    classes,
  } satisfies TailwindState
}

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  handlers: {
    tailwind: () => ({
      GET: async (request) => {
        const hash = new URL(request.url).searchParams.get("hash")
        const state = hash ? null : await getOptionalState(adapter)
        const activeHash = hash || state?.activeHash

        if (!activeHash) {
          return new Response("", {
            status: 404,
            headers: {
              "Cache-Control": "no-store",
              "Content-Type": "text/css; charset=utf-8",
            },
          })
        }

        const css = await getOptionalAsset(adapter, activeHash)

        if (!css) {
          return new Response("", {
            status: 404,
            headers: {
              "Cache-Control": hash
                ? "public, max-age=31536000, immutable"
                : "no-store",
              "Content-Type": "text/css; charset=utf-8",
            },
          })
        }

        return new Response(css, {
          headers: {
            "Cache-Control": hash
              ? "public, max-age=31536000, immutable"
              : "no-store",
            "Content-Type": "text/css; charset=utf-8",
          },
        })
      },
    }),
  },
  adapter: {
    prebuild: async () => {
      await adapter.prebuild()
      await reconcileTailwindState(adapter)
    },
    updatePageData: async (page) => {
      const classes = await getAllPublishedClasses(adapter, page)
      const hash = classes.length ? getHash(classes) : null
      const state = await getState(adapter)

      const needsPersist =
        classes.join("\n") !== state.classes.join("\n") ||
        hash !== state.activeHash ||
        (!!hash && !(await getAsset(adapter, hash)))

      const css = hash && needsPersist ? await buildCss(classes) : null

      await adapter.updatePageData(page)

      if (!needsPersist) {
        return
      }

      await persistState(adapter, classes, hash, css)
    },
  },
})
