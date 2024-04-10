"use client"

import { Fragment, useState } from "react"

import { filesize } from "filesize"
import Link from "next/link"
import { Route } from "next"
import { Button } from "@oberon/ui/button"
import Image from "next/image"
import type { Asset, ServerActions } from "@/app/schema"

export function Assets({
  assets: initialAssets,
  deleteAsset,
}: {
  assets: Asset[]
  deleteAsset: ServerActions["deleteAsset"]
}) {
  const [assets, setAssets] = useState(initialAssets)

  return (
    <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-3 pt-3">
      {assets.map(({ key, name, size, url }) => {
        return (
          <Fragment key={key}>
            <Link href={url as Route} prefetch={false} target="_blank">
              <div className="flex flex-row gap-2">
                <Image src={url} width={24} height={24} alt={name} />
                {name}
              </div>
            </Link>
            <div>{filesize(size)}</div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await deleteAsset({ key })

                setAssets(assets.filter((asset) => asset.key !== key))
              }}
            >
              Delete
            </Button>
          </Fragment>
        )
      })}
    </div>
  )
}
