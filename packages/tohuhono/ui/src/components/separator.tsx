"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn, type CN } from "@tohuhono/utils"

const Separator = ({
  className,
  orientation = "horizontal",
  ...props
}: CN<SeparatorPrimitive.Props>) => (
  <SeparatorPrimitive
    orientation={orientation}
    className={cn(
      `
        shrink-0 bg-border
        data-horizontal:h-px data-horizontal:w-full
        data-vertical:h-full data-vertical:w-px
      `,
      className,
    )}
    {...props}
  />
)

export { Separator }
