import { CNProps, cn } from "@oberon/utils"

export const Prose = ({ children, className }: CNProps) => (
  <div
    className={cn("prose p-2 dark:prose-invert lg:prose-lg sm:p-6", className)}
  >
    {children}
  </div>
)
