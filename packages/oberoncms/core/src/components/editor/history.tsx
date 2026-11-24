"use client"

import { createUsePuck } from "@puckeditor/core"
import { Button } from "@tohuhono/ui/button"

const usePuck = createUsePuck()

export function HistoryControls() {
  const history = usePuck((state) => state.history)
  const isRecorded = usePuck(
    (state) =>
      JSON.stringify(state.history.histories[state.history.index]?.state.data) ===
      JSON.stringify(state.appState.data),
  )
  return (
    <div role="group" aria-label="Edit history" className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={!history.hasPast || !isRecorded}
        onClick={history.back}
      >
        Undo
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={!history.hasFuture || !isRecorded}
        onClick={history.forward}
      >
        Redo
      </Button>
    </div>
  )
}
