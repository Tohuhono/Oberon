"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@tohuhono/utils"

const Separator = ({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) => (
  <SeparatorPrimitive
    orientation={orientation}
    className={cn(
      "bg-border shrink-0 data-horizontal:h-[1px] data-horizontal:w-full data-vertical:h-full data-vertical:w-[1px]",
      className,
    )}
    {...props}
  />
)

export { Separator }
