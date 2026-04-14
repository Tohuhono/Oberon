import { cn } from "@tohuhono/utils"
import type { OberonComponent } from "@oberoncms/core"

export const Container = {
  fields: {
    className: {
      type: "text",
    },
    content: {
      type: "slot",
    },
  },
  render: ({ className, content: Content }) => {
    return (
      <div className={cn("flex w-full justify-center p-2", className)}>
        {Content?.()}
      </div>
    )
  },
} satisfies OberonComponent
