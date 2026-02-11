import type { ComponentConfig } from "@puckeditor/core"
import { Prose as ProseUI } from "@tohuhono/ui/prose"

export const Prose = {
  fields: {
    className: {
      type: "text",
    },
  },
  render: ({ className, puck: { renderDropZone: DropZone } }) => {
    return (
      <ProseUI className={className}>
        <DropZone zone="prose" />
      </ProseUI>
    )
  },
} satisfies ComponentConfig<{ className?: string }>
