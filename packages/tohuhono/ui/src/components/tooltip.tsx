"use client"

import { Children, isValidElement } from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@tohuhono/utils"

const TooltipProvider = ({
  delay,
  delayDuration,
  ...props
}: TooltipPrimitive.Provider.Props & {
  delayDuration?: number
}) => {
  return (
    <TooltipPrimitive.Provider delay={delayDuration ?? delay ?? 0} {...props} />
  )
}

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = ({
  asChild,
  children,
  ...props
}: TooltipPrimitive.Trigger.Props & { asChild?: boolean }) => {
  if (asChild) {
    const onlyChild = children ? Children.only(children) : null
    if (!onlyChild || !isValidElement(onlyChild)) return null
    return <TooltipPrimitive.Trigger render={onlyChild} {...props} />
  }

  return (
    <TooltipPrimitive.Trigger {...props}>{children}</TooltipPrimitive.Trigger>
  )
}

const TooltipContent = ({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className="z-50"
    >
      <TooltipPrimitive.Popup
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
)

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
