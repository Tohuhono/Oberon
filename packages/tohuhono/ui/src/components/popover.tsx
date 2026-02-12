"use client"

import { Children, isValidElement } from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@tohuhono/utils"
import type { ClassNameValue } from "tailwind-merge"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = ({
  asChild,
  children,
  ...props
}: PopoverPrimitive.Trigger.Props & { asChild?: boolean }) => {
  if (asChild) {
    const onlyChild = children ? Children.only(children) : null
    if (!onlyChild || !isValidElement(onlyChild)) return null
    return <PopoverPrimitive.Trigger render={onlyChild} {...props} />
  }

  return (
    <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>
  )
}

const PopoverAnchor = PopoverPrimitive.Trigger

const PopoverContent = ({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className="z-50"
    >
      <PopoverPrimitive.Popup
        className={cn(
          "bg-popover text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-none",
          className as ClassNameValue,
        )}
        {...props}
      />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
)

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
