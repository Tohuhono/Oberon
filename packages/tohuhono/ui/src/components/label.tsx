"use client"

import { cn } from "@tohuhono/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { type ComponentPropsWithRef } from "react"

const labelVariants = cva(
  `
    text-sm font-medium
    peer-disabled:cursor-not-allowed peer-disabled:opacity-70
  `,
)

const Label = ({
  className,
  ...props
}: ComponentPropsWithRef<"label"> & VariantProps<typeof labelVariants>) => (
  <label className={cn(labelVariants(), className)} {...props} />
)

export { Label }
