"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@tohuhono/utils"
import type { ClassNameValue } from "tailwind-merge"

const RadioGroup = ({ className, ...props }: RadioGroupPrimitive.Props) => {
  return (
    <RadioGroupPrimitive
      className={cn("grid gap-2", className as ClassNameValue)}
      {...props}
    />
  )
}

const RadioGroupItem = ({ className, ...props }: RadioPrimitive.Root.Props) => {
  return (
    <RadioPrimitive.Root
      className={cn(
        "border-primary text-primary focus-visible:ring-ring aspect-square h-4 w-4 rounded-full border shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
        className as ClassNameValue,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="fill-primary h-3.5 w-3.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8" />
        </svg>
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
