import type { OberonComponent } from "@oberoncms/core"

export const Box = {
  fields: {
    className: {
      type: "text",
    },
  },
  render: ({ className, puck: { renderDropZone: DropZone } }) => {
    return <div className={className}>{<DropZone zone="box" />}</div>
  },
} satisfies OberonComponent
