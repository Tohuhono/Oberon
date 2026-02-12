"use client"
import {
  type ButtonHTMLAttributes,
  Children,
  cloneElement,
  type ComponentProps,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@tohuhono/utils"

const buttonVariants = cva(
  "focus-visible:ring-ring inline-flex items-center rounded-md font-medium text-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
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

export interface ButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  children?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }))

    if (asChild) {
      const child = Children.only(children)
      if (!isValidElement(child)) return null
      const childElement = child as ReactElement<{ className?: string }>

      return cloneElement(childElement, {
        className: cn(classes, childElement.props.className),
        ...props,
      })
    }

    return (
      <ButtonPrimitive
        ref={ref}
        className={classes}
        {...(props as ComponentProps<typeof ButtonPrimitive>)}
      >
        {children}
      </ButtonPrimitive>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
