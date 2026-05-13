import { cn } from "@tohuhono/utils"
import type { PropsWithChildren } from "react"

export const Spinner = ({
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      role="status"
      className={cn(
        "absolute right-1/2 bottom-1/2 translate-1/2 transform",
        className,
      )}
    >
      <div
        className="
        size-16 animate-spin rounded-full border-4 border-solid border-primary
        border-t-transparent
      "
      ></div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
