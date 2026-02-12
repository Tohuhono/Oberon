import { type ComponentPropsWithRef } from "react"

import { cn } from "@tohuhono/utils"

const Card = ({ className, ...props }: ComponentPropsWithRef<"div">) => (
  <div
    className={cn(
      "bg-card text-card-foreground rounded-xl border shadow",
      className,
    )}
    {...props}
  />
)

const CardHeader = ({ className, ...props }: ComponentPropsWithRef<"div">) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
)

const CardTitle = ({ className, ...props }: ComponentPropsWithRef<"h3">) => (
  <h3
    className={cn("leading-none font-semibold tracking-tight", className)}
    {...props}
  />
)

const CardDescription = ({
  className,
  ...props
}: ComponentPropsWithRef<"p">) => (
  <p className={cn("text-muted-foreground text-sm", className)} {...props} />
)

const CardContent = ({ className, ...props }: ComponentPropsWithRef<"div">) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
)

const CardFooter = ({ className, ...props }: ComponentPropsWithRef<"div">) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
)

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
