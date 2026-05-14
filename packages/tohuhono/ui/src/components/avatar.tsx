"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@tohuhono/utils"

const Avatar = ({
  className,
  ...props
}: Omit<AvatarPrimitive.Root.Props, "className"> & {
  className?: string
}) => (
  <AvatarPrimitive.Root
    className={cn(
      "relative flex size-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
)

const AvatarImage = ({
  className,
  ...props
}: Omit<AvatarPrimitive.Image.Props, "className"> & {
  className?: string
}) => (
  <AvatarPrimitive.Image
    className={cn("aspect-square size-full", className)}
    {...props}
  />
)

const AvatarFallback = ({
  className,
  ...props
}: Omit<AvatarPrimitive.Fallback.Props, "className"> & {
  className?: string
}) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex size-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
)

export { Avatar, AvatarImage, AvatarFallback }
