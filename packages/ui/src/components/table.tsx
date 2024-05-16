import { cn } from "@tohuhono/utils"
import type { PropsWithChildren } from "react"

export const ColumnHeading = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) =>
  children ? (
    <h4 className={cn("m-0 lg:m-0", children && "border-b-2", className)}>
      {children}
    </h4>
  ) : (
    <div />
  )

export const Table = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn("grid w-full items-baseline gap-2 pt-3", className)}>
    {children}
  </div>
)
