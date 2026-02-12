"use client"

import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@tohuhono/utils"

const labelVariants = cva(
  "text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
)

const Label = forwardRef<
  ElementRef<"label">,
  ComponentPropsWithoutRef<"label"> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = "Label"

export { Label }
