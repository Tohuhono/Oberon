"use client"

import { Fragment, startTransition, useOptimistic } from "react"

import { filesize } from "filesize"
import Link from "next/link"
import { Route } from "next"
import { Button } from "@tohuhono/ui/button"
import Image from "next/image"
import { useOberonActions } from "@/hooks/use-oberon"
import type { OberonImage } from "@/app/schema"

const useOberonImages = (images: OberonImage[]) => {
  const { deleteImage } = useOberon()
  const [optimisticImages, optimisticImageUpdate] =
    useOptimistic<OberonImage[]>(images)

  return {
    images: optimisticImages,
    deleteImage: async (key: OberonImage["key"]) => {
      startTransition(() =>
        optimisticImageUpdate(
          optimisticImages.map((image) =>
            image.key === key ? { ...image, pending: true } : image,
          ),
        ),
      )
      return deleteImage(key)
    },
  }
}

export function Images({ images: initialImages }: { images: OberonImage[] }) {
  const { images, deleteImage } = useOberonImages(initialImages)

  return (
    <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-3 pt-3">
      {images.map(({ key, alt, size, url, pending }) => {
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
              disabled={pending}
              onClick={() => deleteImage(key)}
            >
              Delete
            </Button>
          </Fragment>
        )
      })}
    </div>
  )
}
