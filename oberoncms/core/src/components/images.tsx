"use client"

import {
  Fragment,
  startTransition,
  useOptimistic,
  type PropsWithChildren,
} from "react"

import { filesize } from "filesize"
import Link from "next/link"
import { Route } from "next"
import { Button } from "@tohuhono/ui/button"
import { LocalDate } from "@tohuhono/ui/date"
import Image from "next/image"

import { useOberonActions } from "../hooks/use-oberon"
import type { OberonImage } from "../app/schema"

const useOberonImages = (images: OberonImage[]) => {
  const { deleteImage } = useOberonActions()
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

const ColumnHeading = ({ children }: PropsWithChildren) =>
  children ? <div className="border-b-2 py-1">{children}</div> : <div />

export function Images({ images: initialImages }: { images: OberonImage[] }) {
  const { images, deleteImage } = useOberonImages(initialImages)

  return (
    <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto_auto_auto_auto] items-center gap-3 pt-3">
      <ColumnHeading></ColumnHeading>
      <ColumnHeading>Name</ColumnHeading>
      <ColumnHeading>Size</ColumnHeading>
      <ColumnHeading>Uploaded</ColumnHeading>
      <ColumnHeading>By</ColumnHeading>
      <ColumnHeading />

      {images.map(({ key, alt, size, updatedAt, updatedBy, url }) => {
        const pending = false
        return (
          <Fragment key={key}>
            <Link href={url as Route} prefetch={false} target="_blank">
              <Image src={url} width={24} height={24} alt={alt} />
            </Link>
            <div className="flex flex-row gap-2">{alt}</div>
            <div>{filesize(size)}</div>
            <div>
              <LocalDate date={updatedAt} />
            </div>
            <div>{updatedBy}</div>
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
