"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn, type CN } from "@tohuhono/utils"

const Checkbox = ({
  className,
  ...props
}: CN<CheckboxPrimitive.Root.Props>) => (
  <CheckboxPrimitive.Root
    className={cn(
      `
        peer size-4 shrink-0 rounded-sm border border-primary shadow-sm
        focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none
        disabled:cursor-not-allowed disabled:opacity-50
        data-checked:bg-primary data-checked:text-primary-foreground
      `,
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          d="M20 6 9 17l-5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)

export { Checkbox }
