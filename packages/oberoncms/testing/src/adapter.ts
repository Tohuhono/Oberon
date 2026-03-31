import { fromPartial, type test as vitest } from "@dev/vitest"
import type { OberonPluginAdapter } from "@oberoncms/core"
import { testKV } from "./adapter/key-value"

export function createAdapterTest(baseTest: typeof vitest) {
  return baseTest.extend(
    "adapter",
    { scope: "worker" },
    async (): Promise<OberonPluginAdapter> => {
      return fromPartial<OberonPluginAdapter>({})
    },
  )
}

export type AdapterTestAPI = ReturnType<typeof createAdapterTest>

export function createAdapterTests({
  description,
  test,
  getAdapter,
}: {
  description: string
  test: typeof vitest
  getAdapter: (
    onCleanup: (callback: () => Promise<void>) => void,
  ) => Promise<OberonPluginAdapter>
}) {
  const extendedTest = test.extend(
    "adapter",
    { scope: "worker" },
    // eslint-disable-next-line no-empty-pattern
    async ({}, { onCleanup }) => getAdapter(onCleanup),
  )

  extendedTest.describe(description, () => {
    testKV(extendedTest)
  })
}
