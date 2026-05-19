"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn, type CN } from "@tohuhono/utils"

const Avatar = ({ className, ...props }: CN<AvatarPrimitive.Root.Props>) => (
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
}: CN<AvatarPrimitive.Image.Props>) => (
  <AvatarPrimitive.Image
    className={cn("aspect-square size-full", className)}
    {...props}
  />
)

const AvatarFallback = ({
  className,
  ...props
}: CN<AvatarPrimitive.Fallback.Props>) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex size-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
)

export { Avatar, AvatarImage, AvatarFallback }
