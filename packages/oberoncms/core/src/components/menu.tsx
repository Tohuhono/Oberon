import { Button, buttonVariants } from "@tohuhono/ui/button"
import { Link } from "@tohuhono/ui/link"
import { ModeToggle } from "@tohuhono/ui/mode-toggle"
import { PropsWithChildren } from "react"
import useSWR from "swr"

import { useOberonActions } from "../hooks/use-oberon"

export const Menu = ({
  title,
  path,
  children,
  libraryLabel,
}: PropsWithChildren<{
  title?: string
  path?: string
  libraryLabel?: string
}>) => {
  const { can, signOut } = useOberonActions()

  const { data: showImages } = useSWR("/can/images", () => can({ action: "images" }))
  const { data: showUsers } = useSWR("/can/users", () => can({ action: "users" }))

  return (
    <div
      className="
        flex w-full flex-wrap items-center justify-between gap-2 bg-sidebar-background p-2
        text-sidebar-foreground
      "
    >
      {children && <div className="flex max-w-full flex-wrap justify-start gap-1">{children}</div>}
      <div className="flex min-w-0 flex-1 basis-full justify-center wrap-anywhere sm:basis-0">
        {path ? (
          <a href={path} target="_blank" rel="noreferrer" className="min-w-0 truncate">
            {title || path}
          </a>
        ) : (
          title
        )}
      </div>
      <div className="flex w-full flex-wrap justify-end gap-1 sm:w-auto">
        <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/cms/site">
          Site
        </Link>
        <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/cms/pages">
          Pages
        </Link>
        {libraryLabel && (
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/cms/library">
            {libraryLabel}
          </Link>
        )}
        {showImages && (
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/cms/images">
            Images
          </Link>
        )}
        {showUsers && (
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/cms/users">
            Users
          </Link>
        )}
        <ModeToggle className="h-6" />
        <Button size="sm" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    </div>
  )
}
