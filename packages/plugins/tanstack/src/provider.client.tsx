"use client"

import type { OberonServerActions } from "@oberoncms/core"
import { OberonClientProvider } from "@oberoncms/core/provider/client"
import { Link, notFound, useRouter } from "@tanstack/react-router"
import type { LinkComponent } from "@tohuhono/ui/link"
import { useMemo, type ComponentProps } from "react"

const TohuhonoLink: LinkComponent = ({ href, ...props }) => <Link to={href} {...props} />

function useInvalidatingServerActions(serverActions: OberonServerActions) {
  const router = useRouter()

  return useMemo(() => {
    const invalidateAfter =
      <TProps extends unknown[], TResult>(action: (...props: TProps) => Promise<TResult>) =>
      async (...props: TProps) => {
        const reponse = await action(...props)
        await router.invalidate()
        return reponse
      }
    return {
      ...serverActions,
      addImage: invalidateAfter(serverActions.addImage),
      addPage: invalidateAfter(serverActions.addPage),
      addUser: invalidateAfter(serverActions.addUser),
      changeRole: invalidateAfter(serverActions.changeRole),
      deleteImage: invalidateAfter(serverActions.deleteImage),
      deletePage: invalidateAfter(serverActions.deletePage),
      deleteUser: invalidateAfter(serverActions.deleteUser),
      publishPageData: invalidateAfter(serverActions.publishPageData),
    } satisfies OberonServerActions
  }, [serverActions, router])
}

export function TanstackOberonClientProvider({
  context,
  serverActions,
  ...props
}: ComponentProps<typeof OberonClientProvider>) {
  const router = useRouter()
  const invalidatingServerActions = useInvalidatingServerActions(serverActions)

  return (
    <OberonClientProvider
      context={context}
      serverActions={invalidatingServerActions}
      linkComponent={TohuhonoLink}
      navigate={(href) => router.navigate({ to: href })}
      notFound={() => {
        throw notFound()
      }}
      refresh={() => router.invalidate()}
      {...props}
    />
  )
}
