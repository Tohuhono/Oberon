"use client"

import type { FragmentData as Data, OberonClientConfig } from "@oberoncms/core"
import {
  EditorHistory,
  EditorMenu,
  PageEditor,
  PagePreview,
  clearLocalData,
  useOberonNavigation,
} from "@oberoncms/core/editor"
import { createUsePuck, Render, useGetPuck, type Field } from "@puckeditor/core"
import { Button, buttonVariants } from "@tohuhono/ui/button"
import { LocalDate } from "@tohuhono/ui/date"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tohuhono/ui/dialog"
import { Input } from "@tohuhono/ui/input"
import { Label } from "@tohuhono/ui/label"
import { Switch } from "@tohuhono/ui/switch"
import { toast } from "@tohuhono/ui/toast"
import { cn } from "@tohuhono/utils"
import { Component, useMemo, useState, useSyncExternalStore, type PropsWithChildren } from "react"
import useSWR from "swr"
import { z } from "zod"

import {
  SHARED_METADATA,
  ExposureSchema,
  SharedLibrarySchema,
  SharedMetadataSchema,
  createDefinition,
  getNodes,
  getReferences,
  isExposableField,
  validateLibrary,
  type Exposure,
  type SharedDefinition,
} from "./model"
import { getAlias, prepareSession } from "./runtime"

const endpoint = "/cms/api/shared-components"
const usePuck = createUsePuck()
const DraftMetadataSchema = SharedMetadataSchema.extend({
  name: z.string(),
  exposures: z.record(z.string(), ExposureSchema.extend({ label: z.string() })),
})
const ErrorSchema = z.object({ message: z.string() })

class LibraryRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function requestLibrary(method = "GET", data?: unknown) {
  const response = await fetch(endpoint, {
    method,
    cache: "no-store",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  })
  const body: unknown = await response.json()
  if (!response.ok) throw new LibraryRequestError(ErrorSchema.parse(body).message, response.status)
  return SharedLibrarySchema.parse(body)
}

function useLibrary() {
  return useSWR(endpoint, () => requestLibrary(), { keepPreviousData: true })
}

function SharedMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={cn("size-5", className)}
      aria-hidden="true"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" strokeLinejoin="round" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ErrorState({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <section className="mx-auto my-12 max-w-xl rounded-lg border border-destructive/40 bg-card p-6 text-card-foreground">
      <h2 className="text-lg font-semibold">Shared content needs attention</h2>
      <p role="alert" className="mt-2 text-sm text-muted-foreground">
        {error.message}
      </p>
      <div className="mt-5 flex gap-2">
        {retry && (
          <Button onClick={retry} size="sm">
            Try again
          </Button>
        )}
        <a className={buttonVariants({ variant: "outline", size: "sm" })} href="/cms/library">
          Open library
        </a>
        <a className={buttonVariants({ variant: "ghost", size: "sm" })} href="/cms/pages">
          Back to Pages
        </a>
      </div>
    </section>
  )
}

class AuthoringBoundary extends Component<PropsWithChildren, { error: Error | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error("Could not prepare Shared content", error)
  }

  render() {
    return this.state.error ? (
      <ErrorState error={this.state.error} retry={() => window.location.reload()} />
    ) : (
      this.props.children
    )
  }
}

function useSession(
  config: OberonClientConfig,
  definitions: SharedDefinition[],
  sourceId?: string,
) {
  return useMemo(
    () => prepareSession(config, definitions, sourceId),
    [config, definitions, sourceId],
  )
}

function InstancePanel({ definitions, path }: { definitions: SharedDefinition[]; path: string }) {
  const selected = usePuck((state) => state.selectedItem)
  const definition = definitions.find((item) => selected?.type === getAlias(item.id))
  if (!definition) {
    return (
      <aside className="mt-5 border-t border-border pt-4 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <SharedMark />
          Shared components
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Build a design once. Reuse it in Pages and other Shared components.
        </p>
        <a
          className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3 w-full" })}
          href="/cms/library"
        >
          Open Shared components
        </a>
      </aside>
    )
  }
  return (
    <aside className="mt-5 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
      <div className="flex items-center gap-2 font-medium text-primary">
        <SharedMark />
        Shared instance
      </div>
      <p className="mt-2 wrap-anywhere font-medium">{definition.name}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {Object.keys(definition.exposures).length
          ? "These Exposed props belong to this instance. The rest of the design stays shared."
          : "All content belongs to the source. Publish source changes to update every instance."}
      </p>
      <a
        className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3 w-full" })}
        href={`/cms/library?source=${encodeURIComponent(definition.id)}&returnTo=${encodeURIComponent(`/cms/edit${path}`)}`}
      >
        Edit Shared source
      </a>
      <p className="mt-2 text-xs text-muted-foreground">Your Page draft stays in this browser.</p>
    </aside>
  )
}

function PreparedEditor({
  path,
  data,
  config,
  definitions,
}: {
  path: string
  data: Data | null
  config: OberonClientConfig
  definitions: SharedDefinition[]
}) {
  const session = useSession(config, definitions)
  return (
    <PageEditor
      path={path}
      data={data}
      config={session.config}
      draftConfig={config}
      prepareData={session.prepare}
      readData={session.read}
      libraryLabel="Shared"
      fieldsFooter={<InstancePanel definitions={definitions} path={path} />}
    />
  )
}

export function SharedEditor(props: {
  path: string
  data: Data | null
  config: OberonClientConfig
}) {
  const library = useLibrary()
  if (library.error) return <ErrorState error={library.error} retry={() => void library.mutate()} />
  if (!library.data)
    return (
      <div role="status" className="grid h-dvh place-items-center text-muted-foreground">
        Loading Shared components...
      </div>
    )
  return (
    <AuthoringBoundary>
      <PreparedEditor {...props} definitions={library.data.definitions} />
    </AuthoringBoundary>
  )
}

function PreparedPreview({
  path,
  data,
  config,
  definitions,
}: {
  path: string
  data: Data | null
  config: OberonClientConfig
  definitions: SharedDefinition[]
}) {
  const session = useSession(config, definitions)
  return (
    <PagePreview
      path={path}
      data={data}
      config={session.config}
      draftConfig={config}
      prepareData={session.prepare}
    />
  )
}

export function SharedPreview(props: {
  path: string
  data: Data | null
  config: OberonClientConfig
}) {
  const library = useLibrary()
  if (library.error) return <ErrorState error={library.error} retry={() => void library.mutate()} />
  if (!library.data) return <div role="status">Loading Shared components...</div>
  return (
    <AuthoringBoundary>
      <PreparedPreview {...props} definitions={library.data.definitions} />
    </AuthoringBoundary>
  )
}

function useSourceMetadata() {
  const getPuck = useGetPuck()
  const raw: unknown = usePuck((state) => state.appState.data.root.props?.[SHARED_METADATA])
  const metadata = DraftMetadataSchema.parse(raw)
  const updateMetadata = (change: Partial<z.infer<typeof DraftMetadataSchema>>) => {
    const { appState, dispatch } = getPuck()
    const root: Data["root"] = {
      ...appState.data.root,
      props: {
        ...appState.data.root.props,
        [SHARED_METADATA]: { ...metadata, ...change },
      },
    }
    dispatch({
      type: "replaceRoot",
      root,
      recordHistory: true,
    })
  }
  return { metadata, updateMetadata }
}

function SourceToolbar({
  onPublish,
  onReload,
  returnTo,
  conflict,
}: {
  onPublish: (data: Data) => Promise<void>
  onReload: () => void
  returnTo?: string
  conflict: boolean
}) {
  const getPuck = useGetPuck()
  const { metadata, updateMetadata } = useSourceMetadata()
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState("")

  return (
    <div>
      <EditorMenu title="Shared component source" libraryLabel="Shared">
        <a
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href={returnTo ?? "/cms/library"}
        >
          {returnTo ? "Back to Page" : "Back to library"}
        </a>
        <EditorHistory />
        <Button
          size="sm"
          disabled={isPublishing || !metadata.name.trim() || conflict}
          onClick={async () => {
            setIsPublishing(true)
            setError("")
            try {
              await onPublish(getPuck().appState.data)
            } catch (failure) {
              setError(
                failure instanceof Error
                  ? failure.message
                  : "Could not publish the Shared component.",
              )
            } finally {
              setIsPublishing(false)
            }
          }}
        >
          {isPublishing ? "Publishing..." : "Publish source"}
        </Button>
      </EditorMenu>
      <div className="flex flex-wrap items-center gap-3 border-y border-border bg-primary/5 px-4 py-2">
        <SharedMark className="shrink-0 text-primary" />
        <Label htmlFor="shared-source-name" className="sr-only">
          Shared component name
        </Label>
        <Input
          id="shared-source-name"
          aria-label="Shared component name"
          value={metadata.name}
          maxLength={100}
          onChange={(event) => updateMetadata({ name: event.target.value })}
          className="h-8 max-w-72 border-transparent bg-transparent font-medium shadow-none hover:border-input focus:border-input"
        />
        <span className="rounded border border-primary/30 px-2 py-0.5 text-xs font-medium text-primary">
          Source
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          Local draft - Publish to update every instance
        </span>
      </div>
      {conflict && !isPublishing && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm"
        >
          <span>
            This source changed elsewhere. Reload the published source before saving. Reload
            replaces your local changes.
          </span>
          <Button variant="outline" size="sm" onClick={onReload}>
            Reload source
          </Button>
        </div>
      )}
      {error && !conflict && (
        <p
          role="alert"
          className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}

function ExposurePanel({
  config,
  definitions,
  definition,
  read,
}: {
  config: OberonClientConfig
  definitions: SharedDefinition[]
  definition: SharedDefinition
  read: (data: Data) => Data
}) {
  const selected = usePuck((state) => state.selectedItem)
  const getPuck = useGetPuck()
  const { metadata, updateMetadata } = useSourceMetadata()
  const [error, setError] = useState("")
  const fields = selected && config.components[selected.type]?.fields
  const eligible = Object.entries(fields ?? {}).filter(([, field]) => isExposableField(field))
  const exposures = Object.entries(metadata.exposures)

  const toggleExposure = (prop: string, field: Field, enabled: boolean) => {
    if (!selected) return
    const existing = exposures.find(
      ([, exposure]) => exposure.node === selected.props.id && exposure.prop === prop,
    )
    const next = Object.fromEntries(exposures.filter(([key]) => key !== existing?.[0]))
    if (enabled) {
      let label = field.label ?? prop
      let suffix = 1
      while (
        Object.values(next).some((exposure) => exposure.label.toLowerCase() === label.toLowerCase())
      ) {
        label = `${field.label ?? prop} ${++suffix}`
      }
      next[`instance_${crypto.randomUUID().replaceAll("-", "_")}`] = {
        node: selected.props.id,
        prop,
        kind: field.type === "slot" ? "slot" : "prop",
        label,
      }
      try {
        const draft = {
          ...definition,
          data: read(getPuck().appState.data),
          name: metadata.name || definition.name,
          exposures: next,
        }
        validateLibrary([...definitions.filter((item) => item.id !== definition.id), draft], config)
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : "This prop cannot be exposed.")
        return
      }
    }
    setError("")
    updateMetadata({ exposures: next })
  }

  const rename = (key: string, exposure: Exposure, label: string) => {
    updateMetadata({ exposures: { ...metadata.exposures, [key]: { ...exposure, label } } })
  }

  return (
    <aside className="mt-5 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Shared or per instance</h3>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
          {exposures.length} exposed
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Keep design shared. Expose only the props each instance can change. Source values become
        insertion defaults.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      )}
      {selected && eligible.length > 0 ? (
        <div className="mt-4 space-y-3">
          {eligible.map(([prop, field]) => {
            const existing = exposures.find(
              ([, exposure]) => exposure.node === selected.props.id && exposure.prop === prop,
            )
            const label = field.label ?? prop
            return (
              <div key={prop} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={`expose-${prop}`} className="text-xs font-medium">
                    {label}
                  </Label>
                  <Switch
                    id={`expose-${prop}`}
                    aria-label={`Expose ${label}`}
                    checked={Boolean(existing)}
                    onCheckedChange={(checked) => toggleExposure(prop, field, checked)}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {existing
                    ? field.type === "slot"
                      ? "Children belong to each instance"
                      : "Editable on each instance"
                    : "Shared across all instances"}
                </p>
                {existing && (
                  <div className="mt-3">
                    <Label htmlFor={`exposure-label-${prop}`} className="text-xs">
                      Prop label
                    </Label>
                    <Input
                      id={`exposure-label-${prop}`}
                      aria-label={`Label for ${label}`}
                      className="mt-1 h-8 text-xs"
                      value={existing[1].label}
                      maxLength={100}
                      onChange={(event) => rename(existing[0], existing[1], event.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Renaming keeps existing instance values.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          {selected
            ? "This component has no supported props to expose. Nested Shared components keep their own source."
            : "Select a component in the canvas to choose its Exposed props."}
        </p>
      )}
      {exposures.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-medium text-muted-foreground">All Exposed props</h4>
          <ul className="mt-2 space-y-2">
            {exposures.map(([key, exposure]) => (
              <li
                key={key}
                className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1.5"
              >
                <span className="min-w-0 text-xs">
                  <span className="block truncate font-medium">
                    {exposure.label || "Unnamed prop"}
                  </span>
                  <span className="text-muted-foreground">
                    {exposure.kind === "slot" ? "Slot" : exposure.prop}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Make ${exposure.label} shared`}
                  onClick={() => {
                    updateMetadata({
                      exposures: Object.fromEntries(
                        exposures.filter(([otherKey]) => otherKey !== key),
                      ),
                    })
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}

function SourceEditor({
  definition,
  definitions,
  config,
  canWrite,
  onSave,
  returnTo,
}: {
  definition: SharedDefinition
  definitions: SharedDefinition[]
  config: OberonClientConfig
  canWrite: boolean
  onSave: (data: Data, base: SharedDefinition) => Promise<SharedDefinition>
  returnTo?: string
}) {
  const [base, setBase] = useState(definition)
  const session = useSession(config, definitions, definition.id)
  const sourceConfig = useMemo(
    () => ({ ...session.config, root: { ...session.config.root, fields: {} } }),
    [session.config],
  )
  const publish = async (data: Data) => {
    const saved = await onSave(session.read(data), base)
    setBase(saved)
  }
  if (!canWrite) {
    return (
      <>
        <EditorMenu title={definition.name} libraryLabel="Shared">
          <a href="/cms/library" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Back to library
          </a>
        </EditorMenu>
        <p className="border-b bg-muted/50 p-3 text-center text-sm text-muted-foreground">
          Read-only source. Ask an author with Pages write permission to make changes.
        </p>
        <Render config={session.config} data={session.prepare(definition.data)} />
      </>
    )
  }
  return (
    <PageEditor
      path={definition.id}
      draftKey={`shared-source:${definition.id}`}
      data={base.data}
      config={sourceConfig}
      draftConfig={config}
      prepareData={session.prepare}
      readData={session.read}
      onPublish={publish}
      header={
        <SourceToolbar
          onPublish={publish}
          onReload={() => {
            clearLocalData(`shared-source:${definition.id}`, config)
            window.location.reload()
          }}
          returnTo={returnTo}
          conflict={base.updatedAt !== definition.updatedAt}
        />
      }
      fieldsFooter={
        <ExposurePanel
          config={config}
          definitions={definitions}
          definition={base}
          read={session.read}
        />
      }
    />
  )
}

function subscribeLocation(callback: () => void) {
  window.addEventListener("popstate", callback)
  return () => window.removeEventListener("popstate", callback)
}
const locationSnapshot = () => window.location.search
const serverLocationSnapshot = () => ""

export function SharedLibrary({ config }: { config: OberonClientConfig }) {
  const library = useLibrary()
  const { refresh } = useOberonNavigation()
  const search = useSyncExternalStore(subscribeLocation, locationSnapshot, serverLocationSnapshot)
  const params = new URLSearchParams(search)
  const sourceId = params.get("source")
  const requestedReturn = params.get("returnTo")
  const returnTo = requestedReturn?.startsWith("/cms/edit/") ? requestedReturn : undefined
  const [query, setQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState<SharedDefinition | null>(null)

  if (library.error) return <ErrorState error={library.error} retry={() => void library.mutate()} />
  if (!library.data)
    return (
      <div role="status" className="grid min-h-96 place-items-center text-muted-foreground">
        Loading Shared components...
      </div>
    )
  const { definitions, canWrite } = library.data
  const definition = definitions.find((item) => item.id === sourceId)
  if (sourceId) {
    if (!definition)
      return (
        <ErrorState
          error={
            new Error(
              "This Shared component no longer exists. Open the library to choose another source.",
            )
          }
        />
      )
    return (
      <AuthoringBoundary key={sourceId}>
        <SourceEditor
          definition={definition}
          definitions={definitions}
          config={config}
          canWrite={canWrite}
          returnTo={returnTo}
          onSave={async (data, base) => {
            let updated: z.infer<typeof SharedLibrarySchema>
            try {
              updated = await requestLibrary("POST", {
                id: base.id,
                data,
                expectedUpdatedAt: base.updatedAt,
              })
            } catch (failure) {
              if (failure instanceof LibraryRequestError && failure.status === 409) {
                await library.mutate()
              }
              throw failure
            }
            const saved = updated.definitions.find((item) => item.id === base.id)
            if (!saved)
              throw new Error(
                "The published source was not returned. Reload the library before continuing.",
              )
            await library.mutate(updated, { revalidate: false })
            toast({
              title: `Published ${saved.name}`,
              description:
                "Shared changes now apply to every instance. Instance-owned values stay unchanged.",
            })
            return saved
          }}
        />
      </AuthoringBoundary>
    )
  }
  const filtered = definitions
    .filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <EditorMenu title="Shared components" libraryLabel="Shared" />
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
              <SharedMark className="size-4" />
              Your design library
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Shared components</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              One source. Every instance.
              <br />
              Create reusable designs with the components you already use. Keep the design shared
              and give each instance just the controls it needs.
            </p>
          </div>
          {canWrite && (
            <Button
              onClick={() => {
                setNewName("")
                setError("")
                setIsCreating(true)
              }}
              className="gap-2"
            >
              <span aria-hidden="true">+</span>New Shared component
            </Button>
          )}
        </header>
        <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border py-4">
          <Label htmlFor="shared-search" className="sr-only">
            Search Shared components
          </Label>
          <Input
            id="shared-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Shared components..."
            className="max-w-sm bg-card"
          />
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "component" : "components"}
          </p>
          <span className="ml-auto rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
            Published changes update all instances
          </span>
        </div>
        {filtered.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const nodes = [...getNodes(item.data).values()]
              const exposures = Object.values(item.exposures)
              const consumers = definitions.filter(
                (other) => other.id !== item.id && getReferences(other.data).has(item.id),
              )
              return (
                <article
                  key={item.id}
                  className="group flex min-w-0 flex-col rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/50"
                >
                  <div className="flex items-start justify-between gap-3 p-5 pb-3">
                    <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-primary">
                      <SharedMark className="size-6" />
                    </div>
                    <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                      {exposures.length
                        ? `${exposures.length} Exposed ${exposures.length === 1 ? "prop" : "props"}`
                        : "Fully shared"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 px-5 pb-5">
                    <h2 className="wrap-anywhere text-lg font-semibold tracking-tight">
                      <a
                        href={`/cms/library?source=${encodeURIComponent(item.id)}`}
                        className="rounded-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {item.name}
                      </a>
                    </h2>
                    <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">
                      {exposures.length
                        ? exposures.map((exposure) => exposure.label).join(" / ")
                        : "The complete design stays connected to this source."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {nodes.length ? (
                        [
                          ...new Set(
                            nodes.map(
                              (node) =>
                                config.components[node.type]?.label ??
                                (node.type === "SharedComponent" ? "Shared instance" : node.type),
                            ),
                          ),
                        ]
                          .slice(0, 4)
                          .map((label) => (
                            <span
                              key={label}
                              className="rounded bg-muted/60 px-2 py-1 text-xs text-muted-foreground"
                            >
                              {label}
                            </span>
                          ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          An empty canvas, ready for your design
                        </span>
                      )}
                    </div>
                    {consumers.length > 0 && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Nested in {consumers.length} Shared{" "}
                        {consumers.length === 1 ? "component" : "components"}
                      </p>
                    )}
                  </div>
                  <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3">
                    <span className="text-xs text-muted-foreground">
                      {item.updatedAt && <LocalDate date={new Date(item.updatedAt)} />}
                    </span>
                    <div className="flex items-center gap-1">
                      {canWrite && (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => {
                            setError("")
                            setDeleting(item)
                          }}
                        >
                          Delete
                        </Button>
                      )}
                      <a
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                        href={`/cms/library?source=${encodeURIComponent(item.id)}`}
                      >
                        {canWrite ? "Edit source" : "View source"}
                      </a>
                    </div>
                  </footer>
                </article>
              )
            })}
          </div>
        ) : (
          <section className="mt-6 grid min-h-80 place-items-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center">
            <div className="max-w-md">
              <SharedMark className="mx-auto mb-4 size-10 text-primary/70" />
              <h2 className="text-xl font-medium">
                {query ? "No matching Shared components" : "Start with something worth sharing"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {query
                  ? "Try another name, or clear your search to see the full library."
                  : "A Site header, a call to action, or an Article layout. Build it visually, then insert it from the Shared components group in the editor."}
              </p>
              {query ? (
                <Button variant="outline" className="mt-5" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              ) : (
                canWrite && (
                  <Button
                    className="mt-5"
                    onClick={() => {
                      setError("")
                      setIsCreating(true)
                    }}
                  >
                    Create your first Shared component
                  </Button>
                )
              )}
            </div>
          </section>
        )}
        <section className="mt-10 grid gap-5 rounded-lg border border-border bg-card/40 p-5 text-sm md:grid-cols-3">
          {[
            [
              "1",
              "Author the source",
              "Use the same visual editor and registered Puck components as your Pages.",
            ],
            [
              "2",
              "Choose Exposed props",
              "Give each instance its own text or slot children. Everything else stays shared.",
            ],
            [
              "3",
              "Publish once",
              "Source changes reach every instance, without publishing each Page again.",
            ],
          ].map(([step, title, description]) => (
            <div key={step} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {step}
              </span>
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
      <Dialog
        open={isCreating}
        onOpenChange={(open) => {
          if (!busy) setIsCreating(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Shared component</DialogTitle>
            <DialogDescription>
              Give the source a name. You can rename it later without changing its instances.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              if (!newName.trim() || busy) return
              setBusy(true)
              setError("")
              try {
                const created = createDefinition(newName.trim())
                const updated = await requestLibrary("POST", {
                  id: created.id,
                  data: created.data,
                  expectedUpdatedAt: null,
                })
                await library.mutate(updated, { revalidate: false })
                window.location.assign(`/cms/library?source=${encodeURIComponent(created.id)}`)
              } catch (failure) {
                setError(
                  failure instanceof Error
                    ? failure.message
                    : "Could not create the Shared component.",
                )
                setBusy(false)
              }
            }}
          >
            <Label htmlFor="shared-new-name">Name</Label>
            <Input
              id="shared-new-name"
              aria-label="New Shared component name"
              placeholder="For example, Site header"
              value={newName}
              maxLength={100}
              onChange={(event) => setNewName(event.target.value)}
              className="mt-2"
              autoFocus
              required
              disabled={busy}
            />
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter className="mt-5 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !newName.trim()}>
                {busy ? "Creating..." : "Create Shared component"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="wrap-anywhere">
              {deleting ? `Delete ${deleting.name}?` : "Delete Shared component?"}
            </DialogTitle>
            <DialogDescription>
              This removes the published source. Oberon will not delete a source while a Page or
              another Fragment still references it. Unsaved browser drafts are not checked.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                if (!deleting) return
                setBusy(true)
                setError("")
                try {
                  const updated = await requestLibrary("DELETE", {
                    id: deleting.id,
                    expectedUpdatedAt: deleting.updatedAt,
                  })
                  await library.mutate(updated, { revalidate: false })
                  setDeleting(null)
                  toast({ title: `Deleted ${deleting.name}` })
                  refresh()
                } catch (failure) {
                  setError(
                    failure instanceof Error
                      ? failure.message
                      : "Could not delete the Shared component.",
                  )
                } finally {
                  setBusy(false)
                }
              }}
            >
              {busy ? "Deleting..." : "Delete source"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
