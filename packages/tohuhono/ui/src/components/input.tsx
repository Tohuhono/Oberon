import { type ComponentPropsWithRef } from "react"

import { cn } from "@tohuhono/utils"

const Input = ({
  className,
  type,
  ...props
}: ComponentPropsWithRef<"input">) => {
  return (
    <input
      type={type}
      className={cn(
        `
          flex h-9 w-full rounded-md border border-input bg-transparent px-3
          py-1 text-sm shadow-sm transition-colors
          file:border-0 file:bg-transparent file:text-sm file:font-medium
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

export { Input }
