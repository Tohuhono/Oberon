"use client"

import type { Config } from "@measured/puck"
import { DynamicTailwind } from "@oberon/ui/theme"
import { renderConfig } from "./renderConfig"

export const clientConfig = {
  root: {
    render: ({ children }) => (
      <>
        <DynamicTailwind />
        {children}
      </>
    ),
  },
  ...renderConfig,
} as Config
