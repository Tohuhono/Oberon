import { cn } from "@tohuhono/utils"
import type { PropsWithChildren } from "react"

export const Prose = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      `
        prose p-2
        sm:p-6
        lg:prose-lg
        dark:prose-invert
      `,
      className,
    )}
  >
    {children}
  </div>
)
