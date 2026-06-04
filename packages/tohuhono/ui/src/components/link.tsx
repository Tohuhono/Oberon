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

const LinkContext = createContext<LinkComponent | undefined>(undefined)

function AnchorLink({ children, prefetch: _prefetch, ...props }: LinkProps) {
  return <a {...props}>{children}</a>
}

export function LinkProvider({
  children,
  component,
}: PropsWithChildren<{ component: LinkComponent }>) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
}

export const useLinkComponent = () => useContext(LinkContext)

export function Link(props: LinkProps) {
  const Component = useLinkComponent() ?? AnchorLink

  return <Component {...props} />
}
