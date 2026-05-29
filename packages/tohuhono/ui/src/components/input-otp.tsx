"use client"

import { cn } from "@tohuhono/utils"
import { OTPInput, OTPInputContext } from "input-otp"
import { type ComponentPropsWithRef, useContext } from "react"

const InputOTP = ({
  className,
  containerClassName,
  ...props
}: ComponentPropsWithRef<typeof OTPInput>) => (
  <OTPInput
    containerClassName={cn(
      `
        flex items-center gap-2
        has-disabled:opacity-50
      `,
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
)

const InputOTPGroup = ({ className, ...props }: ComponentPropsWithRef<"div">) => (
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
        `
          relative flex size-9 items-center justify-center border-y border-r
          border-input text-sm shadow-sm transition-all
          first:rounded-l-md first:border-l
          last:rounded-r-md
        `,
        isActive && "z-10 ring-1 ring-ring",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div
          className="
            pointer-events-none absolute inset-0 flex items-center
            justify-center
          "
        >
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

const InputOTPSeparator = (props: ComponentPropsWithRef<"div">) => (
  <div role="separator" {...props}>
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M6 12h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
)

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
