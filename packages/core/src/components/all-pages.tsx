"use client"

import { Route } from "next"
import Link from "next/link"
import { Fragment, useState } from "react"
import { Button, buttonVariants, Input } from "@oberon/ui"
import type { Actions } from "@/schema"

export function AllPages({
  keys,
  deletePage,
}: {
  keys: Route[]
  deletePage: Actions["deletePage"]
}) {
  const [newPath, setNewPath] = useState("")

  return (
    <>
      <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-1 pt-3">
        {keys.map((path) => (
          <Fragment key={path}>
            <Link className="pr-6" href={path} prefetch={false}>
              {path}
            </Link>

            <Link
              className={buttonVariants({
                size: "sm",
                className: "no-underline",
              })}
              href={`/cms/edit/${path}`}
              target="_blank"
              prefetch={false}
            >
              Edit
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deletePage(path)}
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
