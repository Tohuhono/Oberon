"use client"

import { OberonClientProvider } from "@oberoncms/core/provider/client"
import NextLink from "next/link"
import { notFound, useRouter } from "next/navigation"
import { type ComponentProps } from "react"

export function NextOberonClientProvider({
  context,
  ...props
}: ComponentProps<typeof OberonClientProvider>) {
  const router = useRouter()

  return (
    <OberonClientProvider
      context={context}
      imageTransform={{ cdn: "nextjs" }}
      linkComponent={NextLink}
      navigate={(href) => router.push(href)}
      notFound={notFound}
      refresh={() => router.refresh()}
      {...props}
    />
  )
}
