"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn, type CN } from "@tohuhono/utils"

const Switch = ({ className, ...props }: CN<SwitchPrimitive.Root.Props>) => (
  <SwitchPrimitive.Root
    className={cn(
      `
        peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center
        rounded-full border-2 border-transparent shadow-sm transition-colors
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        focus-visible:ring-offset-background focus-visible:outline-none
        disabled:cursor-not-allowed disabled:opacity-50
        data-checked:bg-primary
        data-unchecked:bg-input
      `,
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        `
          pointer-events-none block size-4 rounded-full bg-background shadow-lg
          ring-0 transition-transform
          data-checked:translate-x-4
          data-unchecked:translate-x-0
        `,
      )}
    />
  </SwitchPrimitive.Root>
)

export { Switch }
