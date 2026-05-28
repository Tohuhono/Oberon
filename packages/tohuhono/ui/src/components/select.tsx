"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn, type CN } from "@tohuhono/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = ({ className, children, ...props }: CN<SelectPrimitive.Trigger.Props>) => (
  <SelectPrimitive.Trigger
    className={cn(
      `
        flex h-9 w-full items-center justify-between rounded-md border
        border-input bg-transparent px-3 py-2 text-sm shadow-sm
        ring-offset-background
        placeholder:text-muted-foreground
        focus:ring-1 focus:ring-ring focus:outline-none
        disabled:cursor-not-allowed disabled:opacity-50
      `,
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <svg viewBox="0 0 24 24" className="size-4 opacity-50" aria-hidden="true">
        <path
          d="m7 10 5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
)

const SelectContent = ({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: CN<SelectPrimitive.Popup.Props> &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      className="z-50"
    >
      <SelectPrimitive.Popup
        className={cn(
          `
            relative z-50 min-w-32 overflow-hidden rounded-md border bg-popover
            text-popover-foreground shadow-md
            data-closed:animate-out data-closed:fade-out-0
            data-closed:zoom-out-95
            data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95
            data-[side=bottom]:slide-in-from-top-2
            data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2
            data-[side=top]:slide-in-from-bottom-2
          `,
          className,
        )}
        {...props}
      >
        <SelectPrimitive.List>{children}</SelectPrimitive.List>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
)

const SelectLabel = ({ className, ...props }: CN<SelectPrimitive.GroupLabel.Props>) => (
  <SelectPrimitive.GroupLabel
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
)

const SelectItem = ({ className, children, ...props }: CN<SelectPrimitive.Item.Props>) => (
  <SelectPrimitive.Item
    className={cn(
      `
        relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8
        pl-2 text-sm outline-none select-none
        focus:bg-accent focus:text-accent-foreground
        data-disabled:pointer-events-none data-disabled:opacity-50
      `,
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
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
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)

const SelectSeparator = ({ className, ...props }: CN<SelectPrimitive.Separator.Props>) => (
  <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
)

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
