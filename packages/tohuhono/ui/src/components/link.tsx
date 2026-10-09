"use client"

import { createContext, useContext } from "react"
import type { AnchorHTMLAttributes, ComponentType, PropsWithChildren } from "react"

export type LinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    prefetch?: boolean
  }
>

export type LinkComponent = ComponentType<LinkProps>

export const LinkContext = createContext<LinkComponent | undefined>(undefined)

function AnchorLink({ children, prefetch: _prefetch, ...props }: LinkProps) {
  return <a {...props}>{children}</a>
}

const useLinkComponent = () => useContext(LinkContext)

export function Link(props: LinkProps) {
  const Component = useLinkComponent() ?? AnchorLink

  // Context selects an existing component; it does not create one.
  // Related false positive: https://github.com/react/react/issues/34794
  // oxlint-disable-next-line react/static-components
  return <Component {...props} />
}
