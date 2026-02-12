"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cva } from "class-variance-authority"
import { cn } from "@tohuhono/utils"

import { toastManager, type ToastData } from "./toast"

const toastVariants = cva(
  "group data-[starting-style]:animate-in data-[ending-style]:animate-out data-[ending-style]:fade-out-80 data-[ending-style]:slide-out-to-top-full data-[starting-style]:slide-in-from-top-full pointer-events-auto relative w-full overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swiping]:translate-x-[var(--toast-swipe-movement-x)] data-[swiping]:transition-none",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function getToastData(value: unknown): ToastData {
  if (!value || typeof value !== "object") {
    return {}
  }

  const variant = "variant" in value ? value.variant : undefined
  if (variant === "default" || variant === "destructive") {
    return { variant }
  }

  return {}
}

function ToastItems() {
  const { toasts } = ToastPrimitive.useToastManager()

  return (
    <>
      {toasts.map((toast) => {
        const data = getToastData(toast.data)

        return (
          <ToastPrimitive.Root
            key={toast.id}
            toast={toast}
            swipeDirection="right"
            className={cn(
              toastVariants({ variant: data.variant ?? "default" }),
            )}
          >
            <ToastPrimitive.Content className="flex w-full items-start justify-between gap-2 overflow-hidden data-[behind]:opacity-0 data-[expanded]:opacity-100">
              <div className="grid gap-1">
                {toast.title && (
                  <ToastPrimitive.Title className="text-sm font-semibold [&+div]:text-xs">
                    {toast.title}
                  </ToastPrimitive.Title>
                )}
                {toast.description && (
                  <ToastPrimitive.Description className="text-sm opacity-90">
                    {toast.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close className="text-foreground/50 hover:text-foreground absolute top-1 right-1 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:ring-1 focus:outline-none group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M18 6 6 18M6 6l12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </ToastPrimitive.Close>
            </ToastPrimitive.Content>
          </ToastPrimitive.Root>
        )
      })}
    </>
  )
}

export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} limit={1}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed top-0 left-[50%] z-[100] flex max-h-screen w-full translate-x-[-50%] flex-col-reverse p-4 sm:right-0 sm:flex-col md:max-w-[420px]">
          <ToastItems />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}
