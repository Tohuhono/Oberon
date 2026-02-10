import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs"
import type { Component } from "react"

const docsComponents = getDocsMDXComponents()

export function useMDXComponents(components?: Record<string, Component>) {
  return {
    ...docsComponents,
    ...components,
    // ... your additional components
  }
}
