import type { ComponentConfig } from "@measured/puck"

export const Div = {
  fields: {
    className: {
      type: "text",
    },
  },
  render: ({ className, puck: { renderDropZone: DropZone } }) => {
    return <div className={className}>{<DropZone zone="div" />}</div>
  },
} satisfies ComponentConfig
