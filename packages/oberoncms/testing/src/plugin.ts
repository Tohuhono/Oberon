import { type test as vitest } from "@dev/vitest"
import type { OberonPlugin } from "@oberoncms/core"
import { createAdapterTest } from "./adapter"

type InitialisedPlugin = ReturnType<OberonPlugin>

export function createPluginTest(baseTest: typeof vitest) {
  return createAdapterTest(baseTest).extend(
    "plugin",
    { scope: "worker" },
    async (): Promise<InitialisedPlugin> => {
      throw new Error(
        "No plugin fixture provided for createPluginTest; override `plugin` in your test.",
      )
    },
  )
}

export type PluginTestAPI = ReturnType<typeof createPluginTest>
