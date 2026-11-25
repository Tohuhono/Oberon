"use client"

import { createUsePuck } from "@puckeditor/core"
import { buttonVariants } from "@tohuhono/ui/button"
import { Link } from "@tohuhono/ui/link"

import type { SharedComponentData } from "../lib/dtd"
import { SHARED_COMPONENT_TYPE, sourceEditorUrl } from "../lib/shared-components"

const usePuck = createUsePuck()

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
  const sharedComponentKey =
    sharedItem && typeof sharedItem.props.sharedComponentKey === "string"
      ? sharedItem.props.sharedComponentKey
      : null
  const isSharedInstance = sharedItem !== null
  const source = sharedComponentKey ? library[sharedComponentKey] : undefined

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
      <p className="mt-2 text-sm">{source?.name ?? sharedComponentKey}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        These Exposed props belong to this instance. The rest of the design stays shared.
      </p>
      {source && sharedComponentKey ? (
        <Link
          className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}
          href={sourceEditorUrl(sharedComponentKey, `/cms/edit${path}`)}
        >
          Edit Shared source
        </Link>
      ) : (
        <p className="mt-2 text-sm">This Shared component is no longer available.</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">Your Page draft stays in this browser.</p>
    </div>
  )
}
