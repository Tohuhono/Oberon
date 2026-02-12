"use client"

import { ElementRef, forwardRef } from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@tohuhono/utils"
import type { ClassNameValue } from "tailwind-merge"

const Avatar = forwardRef<
  ElementRef<typeof AvatarPrimitive.Root>,
  AvatarPrimitive.Root.Props
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className as ClassNameValue,
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = forwardRef<
  ElementRef<typeof AvatarPrimitive.Image>,
  AvatarPrimitive.Image.Props
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className as ClassNameValue)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = forwardRef<
  ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarPrimitive.Fallback.Props
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "bg-muted flex h-full w-full items-center justify-center rounded-full",
      className as ClassNameValue,
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
