import { Button } from "@tohuhono/ui/button"

export function DraftConflict({
  acceptCurrentPublication,
  discardDraft,
}: {
  acceptCurrentPublication: () => void
  discardDraft: () => void
}) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-2 border-b bg-muted p-3 text-sm">
      <p>
        This draft is based on a different publication. Keeping it lets you replace the current
        publication.
      </p>
      <Button size="sm" variant="outline" onClick={acceptCurrentPublication}>
        Keep draft
      </Button>
      <Button size="sm" variant="outline" onClick={discardDraft}>
        Discard draft and reload
      </Button>
    </div>
  )
}
