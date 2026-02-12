"use client"

import { type ComponentPropsWithRef, useContext } from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@tohuhono/utils"

const InputOTP = ({
  className,
  containerClassName,
  ...props
}: ComponentPropsWithRef<typeof OTPInput>) => (
  <OTPInput
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
)

const InputOTPGroup = ({
  className,
  ...props
}: ComponentPropsWithRef<"div">) => (
  <div className={cn("flex items-center", className)} {...props} />
)

const InputOTPSlot = ({
  index,
  className,
  ...props
}: ComponentPropsWithRef<"div"> & { index: number }) => {
  const inputOTPContext = useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      className={cn(
        "border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "ring-ring z-10 ring-1",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

const InputOTPSeparator = (props: ComponentPropsWithRef<"div">) => (
  <div role="separator" {...props}>
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M6 12h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
)

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
