"use client"

import { OberonClientFrameworkProvider } from "@oberoncms/core/provider"
import { LinkProvider } from "@tohuhono/ui/link"
import NextLink from "next/link"
import { useRouter } from "next/navigation"
import { type PropsWithChildren, useMemo } from "react"

export function NextOberonClientProvider({ children }: PropsWithChildren) {
  const router = useRouter()
  const navigation = useMemo(
    () => ({
      navigate: (href: string) => router.push(href),
      refresh: () => router.refresh(),
    }),
    [router],
  )

  return (
    <LinkProvider component={NextLink}>
      <OberonClientFrameworkProvider navigation={navigation} imageTransform={{ cdn: "nextjs" }}>
        {children}
      </OberonClientFrameworkProvider>
    </LinkProvider>
  )
}
