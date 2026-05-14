import { type ComponentPropsWithRef } from "react"

import { cn } from "@tohuhono/utils"

const Textarea = ({
  className,
  ...props
}: ComponentPropsWithRef<"textarea">) => {
  return (
    <textarea
      className={cn(
        `
          flex min-h-[60px] w-full rounded-md border border-input bg-transparent
          px-3 py-2 text-sm shadow-sm
          placeholder:text-muted-foreground
          focus-visible:ring-1 focus-visible:ring-ring
          focus-visible:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
        `,
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
