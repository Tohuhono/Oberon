"use client"

import { Fragment, useState } from "react"

import { filesize } from "filesize"
import Link from "next/link"
import { Route } from "next"
import { Button } from "@oberon/ui/button"
import Image from "next/image"
import { useOberon } from "@/hooks/use-oberon"
import type { OberonImage } from "@/app/schema"

export function Images({ images: initialImages }: { images: OberonImage[] }) {
  const { deleteImage } = useOberon()
  const [images, setImages] = useState(initialImages)

  return (
    <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-3 pt-3">
      {images.map(({ key, alt, size, url }) => {
        return (
          <Fragment key={key}>
            <Link href={url as Route} prefetch={false} target="_blank">
              <div className="flex flex-row gap-2">
                <Image src={url} width={24} height={24} alt={alt} />
                {alt}
              </div>
            </Link>
            <div>{filesize(size)}</div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await deleteImage({ key })

                setImages(images.filter((image) => image.key !== key))
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
