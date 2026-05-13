import { cn } from "@tohuhono/utils"
import type { PropsWithChildren } from "react"

export const Prose = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn("prose dark:prose-invert lg:prose-lg p-2 sm:p-6", className)}
  >
    {children}
  </div>
)
