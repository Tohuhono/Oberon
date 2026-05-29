"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn, type CN } from "@tohuhono/utils"
import { Children, HTMLAttributes, isValidElement } from "react"

const DropdownMenu = MenuPrimitive.Root

const DropdownMenuTrigger = ({
  asChild,
  children,
  ...props
}: MenuPrimitive.Trigger.Props & {
  asChild?: boolean
}) => {
  if (asChild) {
    const onlyChild = Children.only(children)
    if (!isValidElement(onlyChild)) return null
    return <MenuPrimitive.Trigger render={onlyChild} {...props} />
  }

  return <MenuPrimitive.Trigger {...props}>{children}</MenuPrimitive.Trigger>
}

const DropdownMenuGroup = MenuPrimitive.Group

const DropdownMenuPortal = MenuPrimitive.Portal

const DropdownMenuSub = MenuPrimitive.SubmenuRoot

const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: Omit<MenuPrimitive.SubmenuTrigger.Props, "className"> & {
  className?: string
  inset?: boolean
}) => (
  <MenuPrimitive.SubmenuTrigger
    className={cn(
      `
        flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm
        outline-none select-none
        focus:bg-accent
        data-popup-open:bg-accent
      `,
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <svg viewBox="0 0 24 24" className="ml-auto size-4" aria-hidden="true">
      <path
        d="m9 6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </MenuPrimitive.SubmenuTrigger>
)

const DropdownMenuSubContent = ({
  className,
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  ...props
}: CN<MenuPrimitive.Popup.Props> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) => (
  <DropdownMenuContent
    className={cn(
      `
        min-w-32
        data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95
        data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95
        data-[side=bottom]:slide-in-from-top-2
        data-[side=left]:slide-in-from-right-2
        data-[side=right]:slide-in-from-left-2
        data-[side=top]:slide-in-from-bottom-2
      `,
      className,
    )}
    align={align}
    alignOffset={alignOffset}
    side={side}
    sideOffset={sideOffset}
    {...props}
  />
)

const DropdownMenuContent = ({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  ...props
}: CN<MenuPrimitive.Popup.Props> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className="z-50"
    >
      <MenuPrimitive.Popup
        className={cn(
          `
            z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1
            text-popover-foreground shadow-md
          `,
          `
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
      />
    </MenuPrimitive.Positioner>
  </MenuPrimitive.Portal>
)

const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: Omit<MenuPrimitive.Item.Props, "className"> & {
  className?: string
  inset?: boolean
}) => (
  <MenuPrimitive.Item
    className={cn(
      `
        relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm
        transition-colors outline-none select-none
        focus:bg-accent focus:text-accent-foreground
        aria-selected:bg-secondary aria-selected:text-secondary-foreground
        data-disabled:pointer-events-none data-disabled:opacity-50
      `,
      inset && "pl-8",
      className,
    )}
    {...props}
  />
)

const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: CN<MenuPrimitive.CheckboxItem.Props>) => (
  <MenuPrimitive.CheckboxItem
    className={cn(
      `
        relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8
        text-sm transition-colors outline-none select-none
        focus:bg-accent focus:text-accent-foreground
        data-disabled:pointer-events-none data-disabled:opacity-50
      `,
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <MenuPrimitive.CheckboxItemIndicator>
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
      </MenuPrimitive.CheckboxItemIndicator>
    </span>
    {children}
  </MenuPrimitive.CheckboxItem>
)

const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: CN<MenuPrimitive.RadioItem.Props>) => (
  <MenuPrimitive.RadioItem
    className={cn(
      `
        relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8
        text-sm transition-colors outline-none select-none
        focus:bg-accent focus:text-accent-foreground
        data-disabled:pointer-events-none data-disabled:opacity-50
      `,
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <MenuPrimitive.RadioItemIndicator>
        <svg viewBox="0 0 24 24" className="size-3 fill-current" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
        </svg>
      </MenuPrimitive.RadioItemIndicator>
    </span>
    {children}
  </MenuPrimitive.RadioItem>
)

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: Omit<MenuPrimitive.GroupLabel.Props, "className"> & {
  className?: string
  inset?: boolean
}) => (
  <MenuPrimitive.GroupLabel
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
)

const DropdownMenuSeparator = ({ className, ...props }: CN<MenuPrimitive.Separator.Props>) => (
  <MenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
)

const DropdownMenuShortcut = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
