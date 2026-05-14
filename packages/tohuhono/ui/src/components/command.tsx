"use client"

import {
  type ComponentProps,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@tohuhono/utils"
import { Dialog, DialogContent } from "./dialog"

const Command = ({
  className,
  ...props
}: ComponentPropsWithRef<typeof CommandPrimitive>) => (
  <CommandPrimitive
    className={cn(
      `
        flex size-full flex-col overflow-hidden rounded-md bg-popover
        text-popover-foreground
      `,
      className,
    )}
    {...props}
  />
)

const CommandDialog = ({
  children,
  ...props
}: Omit<ComponentProps<typeof Dialog>, "children"> & {
  children: ReactNode
}) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command
          className="
            [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0
            [&_[cmdk-input-wrapper]_svg]:size-5
            [&_[cmdk-item]_svg]:size-5
            **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium
            **:[[cmdk-group-heading]]:text-muted-foreground
            **:[[cmdk-group]]:px-2
            **:[[cmdk-input]]:h-12
            **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3
          "
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = ({
  className,
  ...props
}: ComponentPropsWithRef<typeof CommandPrimitive.Input>) => (
  <div className="flex items-center border-b px-3" data-cmdk-input-wrapper="">
    <svg
      viewBox="0 0 24 24"
      className="mr-2 size-4 shrink-0 opacity-50"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m20 20-3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
    <CommandPrimitive.Input
      className={cn(
        `
          flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none
          placeholder:text-muted-foreground
          disabled:cursor-not-allowed disabled:opacity-50
        `,
        className,
      )}
      {...props}
    />
  </div>
)

const CommandList = ({
  className,
  ...props
}: ComponentPropsWithRef<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    className={cn("max-h-[300px] overflow-x-hidden overflow-y-auto", className)}
    {...props}
  />
)

const CommandEmpty = (
  props: ComponentPropsWithRef<typeof CommandPrimitive.Empty>,
) => <CommandPrimitive.Empty className="py-6 text-center text-sm" {...props} />

const CommandGroup = ({
  className,
  ...props
}: ComponentPropsWithRef<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    className={cn(
      `
        overflow-hidden p-1 text-foreground
        **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5
        **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium
        **:[[cmdk-group-heading]]:text-muted-foreground
      `,
      className,
    )}
    {...props}
  />
)

const CommandSeparator = ({
  className,
  ...props
}: ComponentPropsWithRef<typeof CommandPrimitive.Separator>) => (
  <CommandPrimitive.Separator
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
)

const CommandItem = ({
  className,
  ...props
}: ComponentPropsWithRef<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn(
      `
        relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm
        outline-none select-none
        data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50
        data-[selected=true]:bg-accent
        data-[selected=true]:text-accent-foreground
      `,
      className,
    )}
    {...props}
  />
)

const CommandShortcut = ({
  className,
  ...props
}: ComponentPropsWithRef<"span">) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
