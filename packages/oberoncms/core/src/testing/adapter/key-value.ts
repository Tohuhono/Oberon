import type { AdapterTestAPI } from "../adapter"

export function testKV(test: AdapterTestAPI) {
  test.describe("KV", () => {
    test.beforeEach(async ({ adapter, skip }) => {
      skip(!("getKV" in adapter && "putKV" in adapter))
    })

    test("updates existing JSON values", async ({ adapter, expect }) => {
      const firstValue = { activeHash: "abc123" }
      const secondValue = { activeHash: "xyz789" }

      await adapter.putKV("tailwind", "state", firstValue)
      await adapter.putKV("tailwind", "state", secondValue)

      await expect(adapter.getKV("tailwind", "state")).resolves.toEqual(
        secondValue,
      )
    })

    test("returns persisted JSON values", async ({ adapter, expect }) => {
      const value = { activeHash: "abc123" }

      await adapter.putKV("tailwind", "state", value)

      await expect(adapter.getKV("tailwind", "state")).resolves.toEqual(value)
    })

    test("deleteKV", async ({ skip, adapter }) => {
      skip(!("deleteKV" in adapter), "adapter does not implement KV")
    })
  })
}
