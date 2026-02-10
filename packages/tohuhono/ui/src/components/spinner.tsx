import { CNProps, cn } from "@tohuhono/utils"

export const Spinner = ({ className }: CNProps) => {
  return (
    <div
      role="status"
      className={cn(
        "absolute right-1/2 bottom-1/2 translate-x-1/2 translate-y-1/2 transform",
        className,
      )}
    >
      <div className="border-primary h-16 w-16 animate-spin rounded-full border-4 border-solid border-t-transparent"></div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
