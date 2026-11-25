"use client"

import "@puckeditor/core/puck.css"
import { Render as PuckRender, type Config } from "@puckeditor/core"
import { Button } from "@tohuhono/ui/button"
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
import { useState } from "react"
import useSWR from "swr"

import { useOberonActions, useOberonNavigation } from "../hooks/use-oberon"
import { INITIAL_DATA, type OberonSharedFragment } from "../lib/dtd"
import { findSharedReferences, sourceEditorUrl } from "../lib/shared-components"
import { Menu } from "./menu"
import { SharedComponentCard } from "./shared-component-card"
import { withSharedComponent } from "./shared-component-render"
import { SharedSourceEditor } from "./shared-source-editor"

export function SharedComponents({
  sources,
  sourceId,
  returnTo,
  clientConfig,
}: {
  sources: OberonSharedFragment[]
  sourceId: string | null
  returnTo: string | null
  clientConfig: Config
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
  const sharedConfig = withSharedComponent(clientConfig, PuckRender, library)
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
    for (const referencedId of findSharedReferences(
      item.data.tree,
      sharedConfig,
      item.data.defaults,
    )) {
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
