"use client"

import "@puckeditor/core/puck.css"
import { createUsePuck, Data, Puck, Render as PuckRender, useGetPuck } from "@puckeditor/core"
import { Button, buttonVariants } from "@tohuhono/ui/button"
import { LocalDate } from "@tohuhono/ui/date"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tohuhono/ui/dialog"
import { Input } from "@tohuhono/ui/input"
import { Link } from "@tohuhono/ui/link"
import { Switch } from "@tohuhono/ui/switch"
import { useMemo, useState, type PropsWithChildren } from "react"
import useSWR from "swr"

import { useLocalData } from "../hooks/use-local-data"
import { useOberonActions, useOberonNavigation } from "../hooks/use-oberon"
import { INITIAL_DATA, type OberonSharedFragment, type SharedComponentData } from "../lib/dtd"
import {
  createSharedExposureKey,
  findSharedReferences,
  getNodeById,
  SHARED_COMPONENT_TYPE,
} from "../lib/shared-components"
import { Preview, PreviewHeading, useViewPort } from "./editor/preview"
import { PreviewIframe } from "./editor/preview-iframe"
import {
  Drawer,
  DrawerItem,
  Sidebar,
  SidebarHeading,
  SidebarTabs,
  useSidebarTab,
} from "./editor/sidebar"
import { Menu } from "./menu"
import { withSharedComponent, withSharedEditorComponents } from "./shared-component-render"

const usePuck = createUsePuck()

function SharedEditorIframe({ children, document }: PropsWithChildren<{ document?: Document }>) {
  return (
    <PreviewIframe iframeDocument={document} previewMode="follow">
      {children}
    </PreviewIframe>
  )
}

function getFieldDetails(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return null
  }

  const type = "type" in value && typeof value.type === "string" ? value.type : undefined
  const label = "label" in value && typeof value.label === "string" ? value.label : undefined

  return { type, label }
}

function renderPuckTree({
  config,
  data,
  metadata,
}: {
  config: Parameters<typeof PuckRender>[0]["config"]
  data: Data
  metadata: Parameters<typeof PuckRender>[0]["metadata"]
}) {
  return <PuckRender data={data} config={config} metadata={metadata} />
}

function sourceEditorUrl(sourceId: string, returnTo: string | null) {
  const search = new URLSearchParams({ source: sourceId })
  if (returnTo?.startsWith("/cms/edit/") && !returnTo.startsWith("//")) {
    search.set("returnTo", returnTo)
  }
  return `/cms/library?${search}`
}

function SharedSourceHeader({
  returnTo,
  onPublish,
  isPublishing,
  isConflicted,
}: {
  returnTo: string | null
  onPublish: (data: Data) => Promise<void>
  isPublishing: boolean
  isConflicted: boolean
}) {
  const { navigate } = useOberonNavigation()
  const getPuck = useGetPuck()

  return (
    <Menu title="Shared component source">
      <Button variant="outline" size="sm" onClick={() => navigate(returnTo ?? "/cms/library")}>
        {returnTo ? "Back to Page" : "Back to library"}
      </Button>
      <Button
        size="sm"
        onClick={() => onPublish(getPuck().appState.data)}
        disabled={isPublishing || isConflicted}
      >
        Publish source
      </Button>
    </Menu>
  )
}

function SharedExposurePanel({
  config,
  exposures,
  defaults,
  setExposures,
  setDefaults,
}: {
  config: Parameters<typeof withSharedComponent>[0]
  exposures: SharedComponentData["exposures"]
  defaults: SharedComponentData["defaults"]
  setExposures: (exposures: SharedComponentData["exposures"]) => void
  setDefaults: (defaults: SharedComponentData["defaults"]) => void
}) {
  const selectedItem = usePuck((state) => state.selectedItem)
  const getPuck = useGetPuck()
  const selectedId = typeof selectedItem?.props.id === "string" ? selectedItem.props.id : null
  const component = selectedItem ? config.components[selectedItem.type] : undefined
  const fields =
    selectedItem?.type === SHARED_COMPONENT_TYPE || selectedItem?.type.startsWith("SharedPalette_")
      ? []
      : Object.entries(component?.fields ?? {})
          .filter(([prop]) => prop !== "id")
          .flatMap(([prop, field]) => {
            const details = getFieldDetails(field)
            return details ? [{ prop, ...details }] : []
          })
  const selectedExposures = exposures.filter((item) => item.nodeId === selectedId)
  const currentData = getPuck().appState.data

  const removeExposure = (key: string) => {
    setExposures(exposures.filter((item) => item.key !== key))
    setDefaults(Object.fromEntries(Object.entries(defaults).filter(([itemKey]) => itemKey !== key)))
  }

  return (
    <section className="mt-6 border-t pt-4">
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Shared or per instance</h3>
        <span className="rounded-full bg-muted px-2 py-1 text-xs">{exposures.length} exposed</span>
      </header>
      <p className="mt-2 text-xs text-muted-foreground">
        Keep design shared. Expose only the props each instance can change. Source values become
        insertion defaults.
      </p>
      {selectedItem ? (
        <div className="mt-4 space-y-2">
          {fields.map(({ prop, label: fieldLabel, type }) => {
            const exposure = selectedExposures.find((item) => item.prop === prop)
            const label = fieldLabel || prop

            return (
              <div key={prop} className="rounded border p-3">
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>{label}</span>
                  <Switch
                    aria-label={`Expose ${label}`}
                    checked={Boolean(exposure)}
                    onCheckedChange={(checked) => {
                      if (checked && selectedId) {
                        setExposures([
                          ...exposures,
                          {
                            key: createSharedExposureKey(),
                            nodeId: selectedId,
                            prop,
                            label,
                          },
                        ])
                      } else if (exposure) {
                        removeExposure(exposure.key)
                      }
                    }}
                  />
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {exposure
                    ? type === "slot"
                      ? "Children belong to each instance"
                      : "Editable on each instance"
                    : "Shared across all instances"}
                </p>
                {exposure && (
                  <div className="mt-3 space-y-1">
                    <label className="text-xs" htmlFor={`shared-prop-label-${exposure.key}`}>
                      Prop label
                    </label>
                    <Input
                      id={`shared-prop-label-${exposure.key}`}
                      value={exposure.label}
                      onChange={(event) =>
                        setExposures(
                          exposures.map((item) =>
                            item.key === exposure.key
                              ? { ...item, label: event.currentTarget.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Renaming keeps existing instance values.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Select a component to manage its props.
        </p>
      )}
      <div className="mt-5 space-y-2">
        <h4 className="text-sm font-medium">All Exposed props</h4>
        {exposures.map((exposure) => {
          const node = getNodeById(currentData, config, exposure.nodeId)
          const field = node && config.components[node.type]?.fields?.[exposure.prop]
          const kind = getFieldDetails(field)?.type

          return (
            <div key={exposure.key} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {exposure.label}{" "}
                <span className="text-muted-foreground">({kind ?? exposure.prop})</span>
              </span>
              <Button size="sm" variant="ghost" onClick={() => removeExposure(exposure.key)}>
                Remove
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SharedSourceEditor({
  source,
  library,
  clientConfig,
  returnTo,
  canWrite,
}: {
  source: OberonSharedFragment
  library: Record<string, SharedComponentData>
  clientConfig: Parameters<typeof withSharedComponent>[0]
  returnTo: string | null
  canWrite: boolean
}) {
  const { publishFragmentData } = useOberonActions()
  const { refresh, navigate } = useOberonNavigation()
  const baseConfig = useMemo(
    () => withSharedComponent(clientConfig, renderPuckTree, library),
    [clientConfig, library],
  )
  const editorSession = useMemo(
    () => withSharedEditorComponents(clientConfig, library, renderPuckTree),
    [clientConfig, library],
  )
  const [localData, setLocalData] = useLocalData(`shared:${source.key}`, baseConfig)
  const data = editorSession.toEditorData(localData || source.data.tree || INITIAL_DATA)
  const [name, setName] = useState(source.data.name)
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(source.updatedAt)
  const [exposures, setExposures] = useState(source.data.exposures)
  const [defaults, setDefaults] = useState(source.data.defaults)
  const { activeTab, setActiveTab } = useSidebarTab()
  const { currentViewport, setCurrentViewport } = useViewPort()
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [isConflicted, setIsConflicted] = useState(false)

  const onChange = (nextData: Data) => {
    setLocalData(editorSession.toStoredData(nextData))
  }

  if (!canWrite) {
    return (
      <div className="min-h-dvh bg-background">
        <Menu title="Shared component source">
          <Button variant="outline" size="sm" onClick={() => navigate(returnTo ?? "/cms/library")}>
            {returnTo ? "Back to Page" : "Back to library"}
          </Button>
        </Menu>
        <p className="m-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          Read-only source. Ask an author with Pages write permission to make changes.
        </p>
        <main className="mx-auto max-w-5xl p-4">
          <PuckRender
            data={editorSession.toEditorData(source.data.tree)}
            config={editorSession.config}
            metadata={{ sharedComponents: library }}
          />
        </main>
      </div>
    )
  }

  const onPublish = async (nextData: Data) => {
    setIsPublishing(true)
    setPublishError(null)
    setIsConflicted(false)
    try {
      const result = await publishFragmentData({
        key: source.key,
        type: "shared",
        data: {
          ...source.data,
          name,
          exposures,
          defaults,
          tree: editorSession.toStoredData(nextData),
        },
        expectedUpdatedAt,
      })
      setExpectedUpdatedAt(result.updatedAt)
      refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not publish Shared component."
      setPublishError(message)
      setIsConflicted(message.includes("Fragment changed since you loaded it"))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Puck
      config={editorSession.config}
      data={data}
      metadata={{ sharedComponents: library }}
      onChange={onChange}
      onPublish={onPublish}
      overrides={{
        drawer: Drawer,
        drawerItem: DrawerItem,
        iframe: SharedEditorIframe,
      }}
    >
      <div className="grid h-dvh grid-cols-[minmax(0,1fr)_auto_300px] grid-rows-[auto_auto_1fr] overflow-hidden bg-card">
        <div className="col-span-3">
          <SharedSourceHeader
            returnTo={returnTo}
            onPublish={onPublish}
            isPublishing={isPublishing}
            isConflicted={isConflicted}
          />
        </div>
        <div className="col-span-3 flex items-center gap-3 border-b bg-card px-4 py-2">
          <span aria-hidden="true" className="text-primary">
            ▱
          </span>
          <Input
            aria-label="Shared component name"
            className="max-w-sm"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-xs">
            Source
          </span>
          <span className="text-xs text-muted-foreground">
            Local draft - Publish to update every instance
          </span>
        </div>
        {publishError && (
          <div
            role="alert"
            className="col-span-3 mx-4 rounded border border-destructive/20 bg-destructive/10 p-3 text-sm"
          >
            {isConflicted
              ? "This source changed elsewhere. Reload before publishing."
              : publishError}
            {isConflicted && (
              <Button
                className="ml-3"
                size="sm"
                variant="outline"
                onClick={() => {
                  setLocalData(null)
                  window.location.assign(sourceEditorUrl(source.key, returnTo))
                }}
              >
                Reload source
              </Button>
            )}
          </div>
        )}
        <PreviewHeading
          className="flex flex-row items-center justify-center gap-6 pt-0.5"
          currentViewport={currentViewport}
          setCurrentViewport={setCurrentViewport}
          previewMode="follow"
          setPreviewMode={() => undefined}
        />
        <div />
        <SidebarHeading
          className="rounded-tl-lg bg-sidebar-primary text-sidebar-primary-foreground"
          activeTab={activeTab}
        />
        <Preview className="p-1" currentViewport={currentViewport} />
        <SidebarTabs
          className="flex flex-col pt-2 [&>button]:aria-selected:bg-sidebar-primary"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <Sidebar
          className="border-t-2 border-l-2 border-sidebar-primary bg-sidebar-background text-sidebar-foreground"
          activeTab={activeTab}
          fieldsFooter={
            <SharedExposurePanel
              config={editorSession.config}
              exposures={exposures}
              defaults={defaults}
              setExposures={setExposures}
              setDefaults={setDefaults}
            />
          }
        />
      </div>
    </Puck>
  )
}

function SharedComponentCard({
  source,
  canWrite,
  nestedInCount,
  onDelete,
}: {
  source: OberonSharedFragment
  canWrite: boolean
  nestedInCount: number
  onDelete: () => Promise<void>
}) {
  const { navigate } = useOberonNavigation()
  const labels = source.data.exposures.map(({ label }) => label)
  const componentTypes = [...new Set(source.data.tree.content.map(({ type }) => type))]
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  return (
    <article className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-2">
        <span aria-hidden="true" className="text-primary">
          ▱
        </span>
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-xs">
          {labels.length ? `${labels.length} Exposed props` : "Fully shared"}
        </span>
      </div>
      <h2 className="mt-3 text-lg font-semibold">
        <button
          className="text-left hover:underline"
          onClick={() => navigate(sourceEditorUrl(source.key, null))}
        >
          {source.data.name}
        </button>
      </h2>
      <p className="mt-1 min-h-5 text-xs text-muted-foreground">
        {labels.length ? labels.join(" / ") : "The complete design stays connected to this source."}
      </p>
      <div className="mt-3 flex min-h-6 flex-wrap gap-1">
        {componentTypes.length
          ? componentTypes.slice(0, 4).map((type) => (
              <span key={type} className="rounded bg-muted px-2 py-1 text-xs">
                {type}
              </span>
            ))
          : "An empty canvas, ready for your design"}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Updated <LocalDate date={source.updatedAt} />
      </p>
      {nestedInCount > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Nested in {nestedInCount} Shared component{nestedInCount === 1 ? "" : "s"}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        {canWrite && (
          <Dialog
            open={deleteOpen}
            onOpenChange={(open) => {
              setDeleteOpen(open)
              if (!open) {
                setDeleteError(null)
              }
            }}
          >
            <DialogTrigger render={<Button size="sm" variant="destructive" />}>
              Delete
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Shared component?</DialogTitle>
                <DialogDescription>
                  Oberon cannot delete a source while a Page or another Shared component references
                  it. Browser drafts are not checked.
                </DialogDescription>
              </DialogHeader>
              {deleteError && (
                <p
                  role="alert"
                  className="rounded border border-destructive/20 bg-destructive/10 p-3 text-sm"
                >
                  {deleteError}
                </p>
              )}
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true)
                    setDeleteError(null)
                    try {
                      await onDelete()
                      setDeleteOpen(false)
                    } catch (error) {
                      setDeleteError(
                        error instanceof Error
                          ? error.message
                          : "Could not delete Shared component.",
                      )
                    } finally {
                      setIsDeleting(false)
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Link className={buttonVariants({ size: "sm" })} href={sourceEditorUrl(source.key, null)}>
          {canWrite ? "Edit source" : "View source"}
        </Link>
      </div>
    </article>
  )
}

export function SharedComponents({
  sources,
  sourceId,
  returnTo,
  clientConfig,
}: {
  sources: OberonSharedFragment[]
  sourceId: string | null
  returnTo: string | null
  clientConfig: Parameters<typeof withSharedComponent>[0]
}) {
  const { addFragment, deleteFragment, can } = useOberonActions()
  const { navigate, refresh } = useOberonNavigation()
  const [name, setName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [search, setSearch] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)
  const { data: canWrite = false } = useSWR("/can/pages/write", () =>
    can({ action: "pages", permission: "write" }),
  )

  const library = Object.fromEntries(sources.map(({ key, data }) => [key, data]))
  const sharedConfig = withSharedComponent(clientConfig, renderPuckTree, library)
  const source = sourceId ? sources.find(({ key }) => key === sourceId) : undefined

  if (source) {
    return (
      <SharedSourceEditor
        source={source}
        library={library}
        clientConfig={clientConfig}
        returnTo={returnTo}
        canWrite={canWrite}
      />
    )
  }

  const filteredSources = sources.filter(({ data }) =>
    data.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  )
  const nestedInCounts = new Map<string, number>()
  for (const item of sources) {
    for (const referencedId of findSharedReferences(item.data.tree, sharedConfig)) {
      if (referencedId !== item.key) {
        nestedInCounts.set(referencedId, (nestedInCounts.get(referencedId) ?? 0) + 1)
      }
    }
  }

  const createSource = async () => {
    setIsCreating(true)
    setCreateError(null)
    try {
      const key = `shared-${crypto.randomUUID()}`
      await addFragment({
        key,
        type: "shared",
        data: { name: name.trim(), tree: INITIAL_DATA, exposures: [], defaults: {} },
      })
      navigate(sourceEditorUrl(key, returnTo))
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Could not create Shared component.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <Menu title="Shared components" />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-primary">Your design library</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Shared components</h1>
            <p className="mt-2 text-sm text-muted-foreground">One source. Every instance.</p>
          </div>
          {canWrite && (
            <Dialog>
              <DialogTrigger render={<Button />}>+ New Shared component</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Shared component</DialogTitle>
                  <DialogDescription>Choose a name for this source.</DialogDescription>
                </DialogHeader>
                <Input
                  aria-label="Shared component name"
                  placeholder="For example, Site header"
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                  <Button onClick={createSource} disabled={!name.trim() || isCreating}>
                    Create Shared component
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </header>
        {sourceId && !source && (
          <p
            role="alert"
            className="rounded border border-destructive/20 bg-destructive/10 p-3 text-sm"
          >
            This Shared component source is no longer available.
          </p>
        )}
        {createError && (
          <p
            role="alert"
            className="rounded border border-destructive/20 bg-destructive/10 p-3 text-sm"
          >
            {createError}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            aria-label="Search Shared components"
            placeholder="Search Shared components..."
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            className="max-w-sm"
          />
          <span className="text-sm text-muted-foreground">
            {filteredSources.length} component{filteredSources.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Published changes update all instances
          </span>
        </div>
        {filteredSources.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSources.map((item) => (
              <SharedComponentCard
                key={item.key}
                source={item}
                canWrite={canWrite}
                nestedInCount={nestedInCounts.get(item.key) ?? 0}
                onDelete={async () => {
                  await deleteFragment({
                    key: item.key,
                    type: "shared",
                    expectedUpdatedAt: item.updatedAt,
                  })
                  refresh()
                }}
              />
            ))}
          </div>
        ) : search ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p>No matching Shared components</p>
            <Button className="mt-3" variant="outline" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <h2 className="text-lg font-semibold">Start with something worth sharing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a Site header, a call to action or an Article layout.
            </p>
          </div>
        )}
        <section className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">How Shared components work</h2>
          <ol className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <li>
              <span className="font-medium text-foreground">1. Author the source.</span> Build a
              design once.
            </li>
            <li>
              <span className="font-medium text-foreground">2. Choose Exposed props.</span> Decide
              what each instance can change.
            </li>
            <li>
              <span className="font-medium text-foreground">3. Publish once.</span> Every instance
              receives the shared update.
            </li>
          </ol>
        </section>
      </main>
    </div>
  )
}

export function SharedInstancePanel({
  path,
  library,
}: {
  path: string
  library: Record<string, SharedComponentData>
}) {
  const selectedItem = usePuck((state) => state.selectedItem)
  const sharedItem =
    selectedItem &&
    (selectedItem.type === SHARED_COMPONENT_TYPE || selectedItem.type.startsWith("SharedPalette_"))
      ? selectedItem
      : null
  const definitionId =
    sharedItem && typeof sharedItem.props.definitionId === "string"
      ? sharedItem.props.definitionId
      : null
  const isSharedInstance = sharedItem !== null
  const source = definitionId ? library[definitionId] : undefined
  const search = new URLSearchParams({
    source: definitionId ?? "",
    returnTo: `/cms/edit${path}`,
  })

  if (!isSharedInstance) {
    return (
      <div className="mt-4 rounded-lg border p-3">
        <h3 className="font-semibold">Open Shared components</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Build a design once. Reuse it in Pages and other Shared components.
        </p>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}
          href="/cms/library"
        >
          Open Shared components
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <h3 className="font-semibold">Shared instance</h3>
      <p className="mt-2 text-sm">{source?.name ?? definitionId}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        These Exposed props belong to this instance. The rest of the design stays shared.
      </p>
      <Link
        className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}
        href={`/cms/library?${search}`}
      >
        Edit Shared source
      </Link>
      <p className="mt-2 text-xs text-muted-foreground">Your Page draft stays in this browser.</p>
    </div>
  )
}
