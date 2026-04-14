import { defineOberonComponent } from "@oberoncms/core"
import { Prose as ProseUI } from "@tohuhono/ui/prose"

export const Prose = defineOberonComponent({
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
      <ProseUI className={className}>
        <Content />
      </ProseUI>
    )
  },
})
