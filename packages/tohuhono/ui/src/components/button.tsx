"use client"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "@tohuhono/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { type ComponentPropsWithRef } from "react"

const buttonVariants = cva(
  `
    inline-flex cursor-pointer items-center rounded-md font-medium text-nowrap
    transition-colors
    focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none
    disabled:pointer-events-none disabled:opacity-50
    aria-selected:bg-secondary aria-selected:text-secondary-foreground
  `,
  {
    variants: {
      variant: {
        default: `
          bg-primary text-primary-foreground shadow-sm
          hover:bg-primary/90
        `,
        destructive: `
          bg-destructive text-destructive-foreground shadow-sm
          hover:bg-destructive/90
        `,
        outline: `
          border border-input bg-transparent shadow-sm
          hover:bg-accent hover:text-accent-foreground
        `,
        secondary: `
          bg-secondary text-secondary-foreground shadow-sm
          hover:bg-secondary/80
        `,
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
        tab: [
          "relative rounded-r-none",
          `
            aria-selected:bg-sidebar-primary
            aria-selected:text-sidebar-primary-foreground
            aria-selected:after:block
          `,
          `
            hover:bg-accent hover:text-accent-foreground
            hover:after:block
          `,
          `
            after:absolute after:right-0 after:hidden after:h-10 after:w-1
            after:rounded-l-full after:bg-inherit after:content-['']
            after:corner-scoop
          `,
        ],
      },
      size: {
        default: "h-8 justify-center px-4 py-2 text-sm",
        sm: "h-6 justify-center rounded-md px-2 text-xs",
        link: "h-6 justify-start rounded-md px-2 text-base",
        lg: "h-10 justify-center rounded-md px-8 text-sm",
        icon: "size-8 justify-center",
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
  children,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<typeof ButtonPrimitive>, "className"> &
  VariantProps<typeof buttonVariants> & {
    className?: string
  }) => {
  const className = cn(buttonVariants({ variant, size, className: classNameProp }))

  return (
    <ButtonPrimitive ref={ref} className={className} {...props}>
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
