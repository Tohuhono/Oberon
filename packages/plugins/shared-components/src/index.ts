import "server-cli-only"
import {
  FragmentRevisionError,
  ResponseError,
  type OberonAdapter,
  type OberonPlugin,
} from "@oberoncms/core"
import type { Config } from "@puckeditor/core"
import { z } from "zod"

import { name, version } from "../package.json" with { type: "json" }
import {
  SHARED_COMPONENT,
  SharedDefinitionSchema,
  getNodes,
  getReferences,
  readDefinition,
  validateContent,
  validateLibrary,
} from "./model"
import { prepareSession } from "./runtime"

const WriteSchema = z.object({
  id: z.string().regex(/^shared:[a-zA-Z0-9-]+$/, "Invalid Shared component identity"),
  data: SharedDefinitionSchema.shape.data,
  expectedUpdatedAt: z.iso.datetime().nullable(),
})
const DeleteSchema = WriteSchema.pick({ id: true }).extend({ expectedUpdatedAt: z.iso.datetime() })

async function readLibrary(adapter: Pick<OberonAdapter, "getAllFragments" | "getFragmentData">) {
  const fragments = await adapter.getAllFragments({ type: "shared" })
  return Promise.all(
    fragments.map(async (fragment) => {
      const data = await adapter.getFragmentData({ key: fragment.key, type: "shared" })
      if (!data)
        throw new ResponseError(
          `Shared component "${fragment.key}" changed while loading. Reload and try again.`,
        )
      return readDefinition({ ...fragment, data })
    }),
  )
}

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } })
}

async function respond(operation: () => Promise<unknown>) {
  try {
    return json(await operation())
  } catch (error) {
    if (error instanceof ResponseError) return json({ message: error.message }, 409)
    if (error instanceof z.ZodError) {
      return json(
        {
          message: error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(". "),
        },
        400,
      )
    }
    if (error instanceof SyntaxError) return json({ message: "Send valid JSON." }, 400)
    console.error("Shared component operation failed", error)
    return json(
      { message: "The Shared component operation failed. Check the server log and try again." },
      500,
    )
  }
}

function checkOrigin(request: Request) {
  const origin = request.headers.get("origin")
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    throw new ResponseError("Open Oberon on this site before changing Shared components.")
  }
}

async function writeWithSnapshot(
  adapter: Pick<OberonAdapter, "getFragmentRevision">,
  expectedRevision: string | undefined,
  write: (revision: string) => Promise<void>,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const revision = await adapter.getFragmentRevision()
    if (expectedRevision !== undefined && expectedRevision !== revision) {
      throw new FragmentRevisionError("Content changed while saving. Reload and try again.")
    }
    try {
      await write(revision)
      return
    } catch (error) {
      if (
        !(error instanceof FragmentRevisionError) ||
        expectedRevision !== undefined ||
        attempt === 4
      ) {
        throw error
      }
    }
  }
}

export function plugin(config: Config): OberonPlugin {
  return () => ({
    name,
    version,
    adapter: {
      getContentClasses:
        ({ getAdapter, next }) =>
        async (content) => {
          const classes = new Set(await next(content))
          const definitions = new Map(
            (await readLibrary(getAdapter())).map((definition) => [definition.id, definition]),
          )
          for (const data of content.fragments) {
            for (const node of getNodes(data).values()) {
              if (node.type !== SHARED_COMPONENT) continue
              const definition = definitions.get(node.props.definitionId)
              if (!definition)
                throw new ResponseError(
                  `Shared component "${String(node.props.definitionId)}" is missing.`,
                )
              for (const [key, exposure] of Object.entries(definition.exposures)) {
                const value = node.props[key]
                if (exposure.prop !== "className" || typeof value !== "string") continue
                for (const token of value.split(/\s+/)) {
                  if (token) classes.add(token)
                }
              }
            }
          }
          return [...classes]
        },
      prepareContent:
        ({ getAdapter, next }) =>
        async (content) => {
          const prepared = await next(content)
          const definitions = await readLibrary(getAdapter())
          const session = prepareSession(prepared.config, definitions)
          return { config: session.config, data: session.prepare(prepared.data) }
        },
      addFragment:
        ({ getAdapter, next }) =>
        async (fragment) => {
          const adapter = getAdapter()
          await writeWithSnapshot(adapter, fragment.expectedRevision, async (expectedRevision) => {
            const definitions = await readLibrary(adapter)
            const library =
              fragment.type === "shared" ? [...definitions, readDefinition(fragment)] : definitions
            validateLibrary(library, config)
            validateContent(fragment.data, library, config)
            await next({ ...fragment, expectedRevision })
          })
          if (fragment.type === "shared") await adapter.contentChanged()
        },
      updateFragmentData:
        ({ getAdapter, next }) =>
        async (fragment) => {
          const adapter = getAdapter()
          await writeWithSnapshot(adapter, fragment.expectedRevision, async (expectedRevision) => {
            const definitions = await readLibrary(adapter)
            const library =
              fragment.type === "shared"
                ? [
                    ...definitions.filter((definition) => definition.id !== fragment.key),
                    readDefinition(fragment),
                  ]
                : definitions
            validateLibrary(library, config)
            validateContent(fragment.data, library, config)
            await next({ ...fragment, expectedRevision })
          })
          if (fragment.type === "shared") await adapter.contentChanged()
        },
      deleteFragment:
        ({ getAdapter, next }) =>
        async (fragment) => {
          const adapter = getAdapter()
          await writeWithSnapshot(adapter, fragment.expectedRevision, async (expectedRevision) => {
            if (fragment.type === "shared") {
              const consumers: string[] = []
              for (const other of await adapter.getAllFragments({})) {
                if (other.key === fragment.key) continue
                const data = await adapter.getFragmentData({ key: other.key })
                if (data && getReferences(data).has(fragment.key)) consumers.push(other.key)
              }
              if (consumers.length) {
                throw new ResponseError(
                  `This Shared component is used by ${consumers.join(", ")}. Remove those instances before deleting its source.`,
                )
              }
            }
            await next({ ...fragment, expectedRevision })
          })
          if (fragment.type === "shared") await adapter.contentChanged()
        },
    },
    handlers: {
      "shared-components": (adapter) => ({
        GET: async () => {
          if (!(await adapter.can({ action: "pages", permission: "read" }))) {
            return json({ message: "You do not have permission to read Shared components." }, 403)
          }
          return respond(async () => {
            const definitions = await readLibrary(adapter)
            validateLibrary(definitions, config)
            return {
              definitions,
              canWrite: await adapter.can({ action: "pages", permission: "write" }),
            }
          })
        },
        POST: async (request) => {
          if (!(await adapter.can({ action: "pages", permission: "write" }))) {
            return json(
              { message: "You do not have permission to publish Shared components." },
              403,
            )
          }
          return respond(async () => {
            checkOrigin(request)
            const input = WriteSchema.parse(await request.json())
            const user = await adapter.whoWill({ action: "pages", permission: "write" })
            const fragment = {
              key: input.id,
              type: "shared",
              data: input.data,
              updatedAt: new Date(),
              updatedBy: user.email,
            }
            if (input.expectedUpdatedAt === null) {
              await adapter.addFragment(fragment)
            } else {
              await adapter.updateFragmentData({
                ...fragment,
                expectedUpdatedAt: new Date(input.expectedUpdatedAt),
              })
            }
            return { definitions: await readLibrary(adapter), canWrite: true }
          })
        },
        DELETE: async (request) => {
          if (!(await adapter.can({ action: "pages", permission: "write" }))) {
            return json({ message: "You do not have permission to delete Shared components." }, 403)
          }
          return respond(async () => {
            checkOrigin(request)
            const input = DeleteSchema.parse(await request.json())
            await adapter.will({ action: "pages", permission: "write" })
            await adapter.deleteFragment({
              key: input.id,
              type: "shared",
              expectedUpdatedAt: new Date(input.expectedUpdatedAt),
            })
            return { definitions: await readLibrary(adapter), canWrite: true }
          })
        },
      }),
    },
  })
}
