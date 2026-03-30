import type { AdapterTestAPI } from "../adapter"

export function testKV(test: AdapterTestAPI) {
  test.describe("KV", () => {
    test.beforeEach(async ({ adapter, skip }) => {
      skip(!("getKV" in adapter && "putKV" in adapter && "deleteKV" in adapter))
    })

    test("returns null for missing keys", async ({ adapter, expect }) => {
      await expect(adapter.getKV("tailwind", "missing")).resolves.toBeNull()
    })

    test("returns persisted JSON values", async ({ adapter, expect }) => {
      const value = {
        activeHash: "abc123",
        nested: { enabled: true, count: 2 },
        order: ["base", "components", "utilities"],
      }

      await adapter.putKV("tailwind", "state", value)

      await expect(adapter.getKV("tailwind", "state")).resolves.toEqual(value)
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

    test("persists large string payloads", async ({ adapter, expect }) => {
      const value = { css: ".btn{" + "color:red;".repeat(2048) + "}" }

      await adapter.putKV("tailwind", "state", value)

      await expect(adapter.getKV("tailwind", "state")).resolves.toEqual(value)
    })

    test("deletes persisted values", async ({ adapter, expect }) => {
      const value = { activeHash: "abc123" }

      await adapter.putKV("tailwind", "state", value)
      await adapter.deleteKV("tailwind", "state")

      await expect(adapter.getKV("tailwind", "state")).resolves.toBeNull()
    })
  })
}
