"use client"

import type { Config } from "@measured/puck"
import { renderConfig } from "./renderConfig"
import { PageLayout } from "@/components/page-layout"
import { DynamicTailwind } from "@/puck/src/components/tailwind"

export const clientConfig = {
  root: {
    render: ({ children }) => (
      <PageLayout>
        <DynamicTailwind />
        {children}
      </PageLayout>
    ),
  },
  ...renderConfig,
} as Config
