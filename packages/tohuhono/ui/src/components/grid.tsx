import type { PropsWithChildren } from "react"

import { cn } from "@tohuhono/utils"

export const Grid = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn("grid w-full items-baseline gap-2", className)}>
    {children}
  </div>
)

export const GridHeading = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <h4 className={cn("m-0 pt-4 lg:m-0", !!children && "border-b-2", className)}>
    {children}
  </h4>
)
