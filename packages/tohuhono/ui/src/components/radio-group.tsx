"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn, type CN } from "@tohuhono/utils"

const RadioGroup = ({ className, ...props }: CN<RadioGroupPrimitive.Props>) => {
  return (
    <RadioGroupPrimitive className={cn("grid gap-2", className)} {...props} />
  )
}

const RadioGroupItem = ({
  className,
  ...props
}: CN<RadioPrimitive.Root.Props>) => {
  return (
    <RadioPrimitive.Root
      className={cn(
        `
          aspect-square size-4 rounded-full border border-primary text-primary
          shadow-sm
          focus:outline-none
          focus-visible:ring-1 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
        `,
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="size-3.5 fill-primary"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8" />
        </svg>
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
