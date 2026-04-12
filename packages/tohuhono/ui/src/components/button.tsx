"use client"
import {
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@tohuhono/utils"

const buttonVariants = cva(
  "focus-visible:ring-ring aria-selected:bg-secondary aria-selected:text-secondary-foreground inline-flex cursor-pointer items-center rounded-md font-medium text-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border-input hover:bg-accent hover:text-accent-foreground border bg-transparent shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        tab: [
          "relative rounded-r-none",
          "aria-selected:bg-sidebar-primary aria-selected:text-sidebar-primary-foreground aria-selected:after:block",
          "hover:bg-accent hover:text-accent-foreground hover:after:block",
          "after:corner-scoop after:absolute after:right-0 after:hidden after:h-10 after:w-1 after:rounded-l-full after:bg-inherit after:content-['']",
        ],
      },
      size: {
        default: "h-8 justify-center px-4 py-2 text-sm",
        sm: "h-6 justify-center rounded-md px-2 text-xs",
        link: "h-6 justify-start rounded-md px-2 text-base",
        lg: "h-10 justify-center rounded-md px-8 text-sm",
        icon: "h-8 w-8 justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const Button = ({
  className: classNameProp,
  variant,
  size,
  asChild,
  children,
  ref,
  ...props
}: Omit<
  ComponentPropsWithRef<typeof ButtonPrimitive>,
  "children" | "className" | "render"
> &
  VariantProps<typeof buttonVariants> & {
    className?: string
  } & (
    | { asChild: true; children: ReactElement }
    | { asChild?: false; children?: ReactNode }
  )) => {
  const className = cn(
    buttonVariants({ variant, size, className: classNameProp }),
  )

  if (asChild) {
    return (
      <ButtonPrimitive
        ref={ref}
        className={className}
        render={children}
        {...props}
      />
    )
  }

  return (
    <ButtonPrimitive ref={ref} className={className} {...props}>
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
