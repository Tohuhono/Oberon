import { CNProps, cn } from "@tohuhono/utils"

export const Prose = ({ children, className }: CNProps) => (
  <div
    className={cn("prose dark:prose-invert lg:prose-lg p-2 sm:p-6", className)}
  >
    {children}
  </div>
)
