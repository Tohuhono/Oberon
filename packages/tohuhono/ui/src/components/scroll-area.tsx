"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@tohuhono/utils"
import type { ClassNameValue } from "tailwind-merge"

const ScrollArea = ({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Root.Props) => (
  <ScrollAreaPrimitive.Root
    className={cn("relative overflow-hidden", className as ClassNameValue)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
)

const ScrollBar = ({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) => (
  <ScrollAreaPrimitive.Scrollbar
    orientation={orientation}
    className={cn(
      "flex touch-none transition-colors select-none",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className as ClassNameValue,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb className="bg-border relative flex-1 rounded-full" />
  </ScrollAreaPrimitive.Scrollbar>
)

export { ScrollArea, ScrollBar }
