"use client"

import { Route } from "next"
import Link from "next/link"
import { Fragment, useState } from "react"
import { Button, buttonVariants } from "@oberon/ui/button"
import { Input } from "@oberon/ui/input"
import type { ServerActions } from "@/app/schema"

export function AllPages({
  routes,
  deletePage,
}: {
  routes: Route[]
  deletePage: ServerActions["deletePage"]
}) {
  const [newPath, setNewPath] = useState("")

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
          value={newPath}
          onChange={(e) => setNewPath(e.currentTarget.value)}
        />
        <Link
          className={buttonVariants({
            size: "sm",
            className: "col-span-2 no-underline",
          })}
          href={`/cms/edit/${newPath}`}
          target="_blank"
          prefetch={false}
        >
          New Page
        </Link>
      </div>
    </>
  )
}
