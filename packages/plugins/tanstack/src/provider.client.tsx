"use client"

import { OberonClientProvider } from "@oberoncms/core/provider/client"
import { notFound, useRouter } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { type ComponentProps } from "react"

export function TanstackOberonClientProvider({
  context,
  ...props
}: ComponentProps<typeof OberonClientProvider>) {
  const router = useRouter()

  return (
    <OberonClientProvider
      context={context}
      linkComponent={({ href }) => <Link to={href} />}
      navigate={(href) => router.navigate({ to: href })}
      notFound={() => {
        throw notFound()
      }}
      refresh={() => router.invalidate()}
      {...props}
    />
  )
}
