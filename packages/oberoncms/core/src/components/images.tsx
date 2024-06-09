"use client"

import { Fragment, startTransition, useOptimistic } from "react"

import { filesize } from "filesize"
import Link from "next/link"
import { Route } from "next"
import { Button } from "@tohuhono/ui/button"
import { LocalDate } from "@tohuhono/ui/date"
import Image from "next/image"

import { Table, ColumnHeading } from "@tohuhono/ui/table"

import { useOberonActions } from "../hooks/use-oberon"
import type { OberonImage } from "../lib/dtd"

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

export function Images({ images: initialImages }: { images: OberonImage[] }) {
  const { images, deleteImage } = useOberonImages(initialImages)

  return (
    <Table className="grid-cols-[auto_1fr_auto_auto_auto_auto]">
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
              <Image
                src={url}
                width={28}
                height={28}
                alt={alt}
                className="m-0 lg:m-0"
              />
            </Link>

            <div>{alt}</div>
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
    </Table>
  )
}
