"use client"

import { Fragment, startTransition, useOptimistic } from "react"

import { filesize } from "filesize"
import { Button } from "@tohuhono/ui/button"
import { LocalDate } from "@tohuhono/ui/date"
import Image from "next/image"

import { Grid, GridHeading } from "@tohuhono/ui/grid"
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
    <Grid className="grid-cols-[auto_1fr_auto_auto_auto_auto]">
      <GridHeading></GridHeading>
      <GridHeading>Name</GridHeading>
      <GridHeading>Size</GridHeading>
      <GridHeading>Uploaded</GridHeading>
      <GridHeading>By</GridHeading>
      <GridHeading />

      {images.map(({ key, alt, size, updatedAt, updatedBy, url }) => {
        const pending = false
        return (
          <Fragment key={key}>
            <a href={url} target="_blank" rel="noreferrer">
              <Image
                src={url}
                width={28}
                height={28}
                alt={alt}
                className="m-0 lg:m-0"
              />
            </a>

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
    </Grid>
  )
}
