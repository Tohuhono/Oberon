import Link from "next/link"
import { PropsWithChildren } from "react"
import { Button, buttonVariants } from "@tohuhono/ui/button"
import { ThemeEditorMenu } from "@tohuhono/ui/theme"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { useOberonActions } from "../hooks/use-oberon"

export const Menu = ({
  title,
  path,
  children,
}: PropsWithChildren<
  { title?: string; path: string } | { title: string; path?: string }
>) => {
  const { can, signOut } = useOberonActions()

  const router = useRouter()

  const { data: showImages } = useSWR("/can/images", () => can("images"))
  const { data: showUsers } = useSWR("/can/users", () => can("users"))

  return (
    <div className="text-foreground grid w-full grid-cols-3 items-center p-2">
      <div className="flex justify-start gap-1">{children}</div>
      <div className="flex justify-center">
        {path ? (
          <a href={path} target="_blank" rel="noreferrer">
            {title || path}
          </a>
        ) : (
          title
        )}
      </div>
      <div className="flex justify-end gap-1">
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href="/cms/site"
        >
          Site
        </Link>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href="/cms/pages"
        >
          Pages
        </Link>
        {showImages && (
          <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            href="/cms/images"
          >
            Images
          </Link>
        )}
        {showUsers && (
          <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            href="/cms/users"
          >
            Users
          </Link>
        )}
        <ThemeEditorMenu className="h-6" />
        <Button
          size="sm"
          onClick={async () => {
            await signOut()
            router.refresh()
          }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}
