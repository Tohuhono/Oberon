import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cn, type CN } from "@tohuhono/utils"
import { cva } from "class-variance-authority"
import type { ComponentPropsWithoutRef } from "react"

const NavigationMenu = ({
  className,
  children,
  ...props
}: CN<NavigationMenuPrimitive.Root.Props>) => (
  <NavigationMenuPrimitive.Root
    className={cn(
      "grid w-full grid-flow-col items-center justify-between bg-background p-1",
      className,
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
}: Omit<ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>, "className"> & {
  className?: string
}) => (
  <NavigationMenuPrimitive.List
    className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
    {...props}
  />
)

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  `
    group inline-flex h-9 w-max items-center justify-center rounded-md
    bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm
    transition-colors
    hover:bg-primary/80
    focus:bg-accent focus:text-accent-foreground focus:outline-none
    disabled:pointer-events-none disabled:opacity-50
    data-active:bg-accent/50
    data-popup-open:bg-accent/50
  `,
)

const NavigationMenuTrigger = ({
  className,
  children,
  ...props
}: CN<NavigationMenuPrimitive.Trigger.Props>) => (
  <NavigationMenuPrimitive.Trigger
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <svg
      viewBox="0 0 24 24"
      className="
        relative top-px ml-1 size-3 transition duration-300
        group-data-popup-open:rotate-180
      "
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
}: Omit<ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>, "className"> & {
  className?: string
}) => (
  <NavigationMenuPrimitive.Content
    className={cn(
      `
        top-0 left-0 w-full
        data-ending-style:animate-out data-ending-style:fade-out
        data-starting-style:animate-in data-starting-style:fade-in
        data-[activation-direction=left]:data-ending-style:slide-out-to-left-52
        data-[activation-direction=left]:data-starting-style:slide-in-from-left-52
        data-[activation-direction=right]:data-ending-style:slide-out-to-right-52
        data-[activation-direction=right]:data-starting-style:slide-in-from-right-52
        md:absolute md:w-auto
      `,
      className,
    )}
    {...props}
  />
)

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = ({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Positioner>, "className"> & {
  className?: string
}) => (
  <NavigationMenuPrimitive.Portal>
    <NavigationMenuPrimitive.Positioner
      className={cn("absolute top-full left-0 z-50 flex justify-center", className)}
      side="bottom"
      align="start"
      sideOffset={0}
      alignOffset={0}
      {...props}
    >
      <NavigationMenuPrimitive.Popup className="relative mt-1.5">
        <NavigationMenuPrimitive.Viewport
          className={cn(
            `
              h-(--height) w-full origin-top overflow-hidden rounded-md border
              bg-popover text-popover-foreground shadow-sm
              data-closed:animate-out data-closed:zoom-out-95
              data-open:animate-in data-open:zoom-in-90
              md:w-(--width)
            `,
          )}
        />
      </NavigationMenuPrimitive.Popup>
    </NavigationMenuPrimitive.Positioner>
  </NavigationMenuPrimitive.Portal>
)

const NavigationMenuIndicator = ({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Icon>, "className"> & {
  className?: string
}) => (
  <NavigationMenuPrimitive.Icon
    className={cn(
      `
        top-full z-1 flex h-1.5 items-end justify-center overflow-hidden
        data-hidden:animate-out data-hidden:fade-out
        data-visible:animate-in data-visible:fade-in
      `,
      className,
    )}
    {...props}
  >
    <div
      className="
        relative top-[60%] size-2 rotate-45 rounded-tl-sm bg-border shadow-md
      "
    />
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
