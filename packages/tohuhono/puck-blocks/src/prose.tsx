import type { ComponentConfig, SlotComponent } from "@puckeditor/core"
import { Prose as ProseUI } from "@tohuhono/ui/prose"

export const Prose = {
  fields: {
    className: {
      type: "text",
    },
    content: {
      type: "slot",
    },
  },
  render: ({ className, content: Content }) => {
    return <ProseUI className={className}>{Content?.()}</ProseUI>
  },
} satisfies ComponentConfig<{ className?: string; content?: SlotComponent }>
