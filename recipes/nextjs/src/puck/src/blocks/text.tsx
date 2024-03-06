import { ComponentConfig } from "@measured/puck"
import { Primitive, primitives } from "@/puck/types"

export const Text: ComponentConfig<{
  text: string
  primitive?: Primitive
  className?: string
}> = {
  fields: {
    text: {
      type: "textarea",
    },
    primitive: {
      type: "select",
      options: primitives.map((p) => ({ label: p, value: p })),
    },
    className: {
      type: "text",
    },
  },
  defaultProps: {
    text: "Text",
    primitive: "p",
  },
  render: ({ text, className, primitive }) => {
    const Comp = primitive || "div"
    return <Comp className={className}>{text}</Comp>
  },
}
