import type { ComponentPropsWithoutRef } from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cva } from "class-variance-authority"

import { cn } from "@tohuhono/utils"
import type { ClassNameValue } from "tailwind-merge"

const NavigationMenu = ({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props) => (
  <NavigationMenuPrimitive.Root
    className={cn(
      "bg-background grid w-full grid-flow-col items-center justify-between p-1",
      className as ClassNameValue,
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
)

const NavigationMenuList = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>) => (
  <NavigationMenuPrimitive.List
    className={cn(
      "group flex flex-1 list-none items-center justify-center gap-1",
      className as ClassNameValue,
    )}
    {...props}
  />
)

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group bg-background bg-primary text-primary-foreground hover:bg-primary/80 focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[popup-open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
)

const NavigationMenuTrigger = ({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) => (
  <NavigationMenuPrimitive.Trigger
    className={cn(
      navigationMenuTriggerStyle(),
      "group",
      className as ClassNameValue,
    )}
    {...props}
  >
    {children}{" "}
    <svg
      viewBox="0 0 24 24"
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[popup-open]:rotate-180"
      aria-hidden="true"
    >
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </NavigationMenuPrimitive.Trigger>
)

const NavigationMenuContent = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>) => (
  <NavigationMenuPrimitive.Content
    className={cn(
      "data-[starting-style]:animate-in data-[ending-style]:animate-out data-[starting-style]:fade-in data-[ending-style]:fade-out data-[activation-direction=right]:data-[starting-style]:slide-in-from-right-52 data-[activation-direction=left]:data-[starting-style]:slide-in-from-left-52 data-[activation-direction=right]:data-[ending-style]:slide-out-to-right-52 data-[activation-direction=left]:data-[ending-style]:slide-out-to-left-52 top-0 left-0 w-full md:absolute md:w-auto",
      className as ClassNameValue,
    )}
    {...props}
  />
)

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Positioner>) => (
  <NavigationMenuPrimitive.Portal>
    <NavigationMenuPrimitive.Positioner
      className={cn(
        "absolute top-full left-0 z-50 flex justify-center",
        className as ClassNameValue,
      )}
      side="bottom"
      align="start"
      sideOffset={0}
      alignOffset={0}
      {...props}
    >
      <NavigationMenuPrimitive.Popup className="relative mt-1.5">
        <NavigationMenuPrimitive.Viewport
          className={cn(
            "origin-top-center bg-popover text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:zoom-out-95 data-[open]:zoom-in-90 h-[var(--height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--width)]",
          )}
        />
      </NavigationMenuPrimitive.Popup>
    </NavigationMenuPrimitive.Positioner>
  </NavigationMenuPrimitive.Portal>
)

const NavigationMenuIndicator = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Icon>) => (
  <NavigationMenuPrimitive.Icon
    className={cn(
      "data-[visible]:animate-in data-[hidden]:animate-out data-[hidden]:fade-out data-[visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
      className as ClassNameValue,
    )}
    {...props}
  >
    <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
  </NavigationMenuPrimitive.Icon>
)

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
