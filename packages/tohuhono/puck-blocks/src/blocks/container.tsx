import { cn } from "@tohuhono/utils"
import type { OberonComponent } from "@oberoncms/core"

export const Container = {
  fields: {
    className: {
      type: "text",
    },
  },
  render: ({ className, puck: { renderDropZone: DropZone } }) => {
    return (
      <div className={cn("flex w-full justify-center p-2", className)}>
        {<DropZone zone="box" />}
      </div>
    )
  },
} satisfies OberonComponent
