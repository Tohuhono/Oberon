import { ComponentConfig } from "@measured/puck"
export const Div: ComponentConfig<{
  className?: string
}> = {
  fields: {
    className: {
      type: "text",
    },
  },
  render: ({ className, puck: { renderDropZone: DropZone } }) => {
    return <div className={className}>{<DropZone zone="div" />}</div>
  },
}
