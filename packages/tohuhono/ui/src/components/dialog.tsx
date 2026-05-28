"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn, type CN } from "@tohuhono/utils"
import { type HTMLAttributes } from "react"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = ({ className, ...props }: CN<DialogPrimitive.Backdrop.Props>) => (
  <DialogPrimitive.Backdrop
    className={cn(
      `
        fixed inset-0 z-50 bg-black/80
        data-closed:animate-out data-closed:fade-out-0
        data-open:animate-in data-open:fade-in-0
      `,
      className,
    )}
    {...props}
  />
)

const DialogContent = ({ className, children, ...props }: CN<DialogPrimitive.Popup.Props>) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Popup
      className={cn(
        `
          fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg
          translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6
          shadow-lg duration-200
          data-closed:animate-out data-closed:fade-out-0
          data-closed:slide-out-to-left-1/2 data-closed:slide-out-to-top-[48%]
          data-closed:zoom-out-95
          data-open:animate-in data-open:fade-in-0
          data-open:slide-in-from-left-1/2 data-open:slide-in-from-top-[48%]
          data-open:zoom-in-95
          sm:rounded-lg
        `,
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="
          absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background
          transition-opacity
          hover:opacity-100
          focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none
          disabled:pointer-events-none
          data-open:bg-accent data-open:text-muted-foreground
        "
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            d="M18 6 6 18M6 6l12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Popup>
  </DialogPortal>
)

const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      `
        flex flex-col space-y-1.5 text-center
        sm:text-left
      `,
      className,
    )}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      `
        flex flex-col-reverse
        sm:flex-row sm:justify-end sm:space-x-2
      `,
      className,
    )}
    {...props}
  />
)

const DialogTitle = ({ className, ...props }: CN<DialogPrimitive.Title.Props>) => (
  <DialogPrimitive.Title
    className={cn("text-lg leading-none font-semibold tracking-tight", className)}
    {...props}
  />
)

const DialogDescription = ({ className, ...props }: CN<DialogPrimitive.Description.Props>) => (
  <DialogPrimitive.Description
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
)

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
