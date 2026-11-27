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
        const response = await action(...props)
        await router.invalidate({ sync: true })
        return response
      }
    return {
      ...serverActions,
      addImage: invalidateAfter(serverActions.addImage),
      addComponent: invalidateAfter(serverActions.addComponent),
      addUser: invalidateAfter(serverActions.addUser),
      changeRole: invalidateAfter(serverActions.changeRole),
      deleteImage: invalidateAfter(serverActions.deleteImage),
      deleteComponent: invalidateAfter(serverActions.deleteComponent),
      deleteUser: invalidateAfter(serverActions.deleteUser),
      publishComponent: invalidateAfter(serverActions.publishComponent),
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
      refresh={() => router.invalidate({ sync: true })}
      {...props}
    />
  )
}
