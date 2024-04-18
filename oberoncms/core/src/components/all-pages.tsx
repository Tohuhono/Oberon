"use client"

import { Route } from "next"
import Link from "next/link"
import { Fragment, useState } from "react"
import { Button, buttonVariants } from "@oberon/ui/button"
import { Input } from "@oberon/ui/input"
import { useOberon } from "@/hooks/use-oberon"

export function AllPages({ routes }: { routes: Route[] }) {
  const { deletePage, addPage } = useOberon()
  const [path, setPath] = useState("/")

  return (
    <>
      <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-1 pt-3">
        {routes.map((route) => (
          <Fragment key={route}>
            <Link className="pr-6" href={route} prefetch={false}>
              {route}
            </Link>

            <Link
              className={buttonVariants({
                size: "sm",
                className: "no-underline",
              })}
              href={`/cms/edit/${route}`}
              target="_blank"
              prefetch={false}
            >
              Edit
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deletePage(route)}
            >
              Delete
            </Button>
          </Fragment>
        ))}
        <Input
          value={path}
          onChange={(e) => {
            const newPath = e.currentTarget.value

            setPath(newPath.charAt(0) === "/" ? newPath : "/" + newPath)
          }}
        />
        <Button size="sm" onClick={() => addPage(path)} className="col-span-2">
          New Page
        </Button>
      </div>
    </>
  )
}
