"use client"

import { LayersIcon } from "@radix-ui/react-icons"
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
import { Link } from "@tohuhono/ui/link"
import { useState } from "react"

import { useOberonNavigation } from "../hooks/use-oberon"
import type { OberonSharedFragment } from "../lib/dtd"
import { sourceEditorUrl } from "../lib/shared-components"

export function SharedComponentCard({
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
        <LayersIcon aria-hidden="true" className="text-primary" />
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-xs">
          {labels.length
            ? `${labels.length} Exposed prop${labels.length === 1 ? "" : "s"}`
            : "Fully shared"}
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
