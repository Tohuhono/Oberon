import { ComponentConfig } from "@measured/puck"
import { cn } from "@/lib/utils"
import { Primitive, primitives } from "@/puck/types"

export const Zone: ComponentConfig<{
  className?: string
  primitive?: Primitive
}> = {
  fields: {
    className: {
      type: "text",
    },
    primitive: {
      type: "select",
      options: primitives.map((p) => ({ label: p, value: p })),
    },
  },
  defaultProps: {
    primitive: "div",
  },
  render: ({ className, primitive, puck: { renderDropZone: DropZone } }) => {
    const Comp = primitive || "div"
    return (
      <Comp className={cn("min-h-3 min-w-3", className)}>
        <DropZone zone="0" />
      </Comp>
    )
  },
}
