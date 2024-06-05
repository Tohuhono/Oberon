import { cn, type OberonComponent } from "@oberoncms/core"

export const Container = {
  fields: {
    className: {
      type: "text",
    },
  },
  render: ({ className, puck: { renderDropZone: DropZone } }) => {
    return (
      <div className={cn("flex w-full p-2 justify-center", className)}>
        {<DropZone zone="box" />}
      </div>
    )
  },
} satisfies OberonComponent
