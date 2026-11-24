import { ResponseError } from "@oberoncms/core"

import type { AdapterTestAPI } from "../adapter"

const data = {
  content: [{ type: "Text", props: { id: "text", text: "Fragment" } }],
  root: { props: { title: "Fragment" } },
}
const sharedData = { name: "Fragment", tree: data, exposures: [], defaults: {} }

export function testFragments(test: AdapterTestAPI) {
  test.describe("Fragments", () => {
    test.beforeEach(async ({ adapter, skip }) => {
      skip(
        !(
          "addFragment" in adapter &&
          "deleteFragment" in adapter &&
          "getAllFragments" in adapter &&
          "getFragmentData" in adapter &&
          "updateFragmentData" in adapter
        ),
      )
    })

    test("filters metadata and data by Fragment type", async ({ adapter, expect }) => {
      const key = `fragment-${crypto.randomUUID()}`
      const updatedAt = new Date("2026-01-01T00:00:00.000Z")

      await adapter.addFragment({
        key,
        type: "shared",
        data: sharedData,
        updatedAt,
        updatedBy: "test@example.com",
      })

      await expect(adapter.getAllFragments("page")).resolves.not.toContainEqual(
        expect.objectContaining({ key }),
      )
      await expect(adapter.getAllFragments("shared")).resolves.toContainEqual({
        key,
        type: "shared",
        updatedAt,
        updatedBy: "test@example.com",
      })
      await expect(adapter.getFragmentData({ key, type: "page" })).resolves.toBeNull()
      await expect(adapter.getFragmentData({ key, type: "shared" })).resolves.toMatchObject({
        key,
        type: "shared",
        data: sharedData,
        updatedAt,
        updatedBy: "test@example.com",
      })

      await adapter.deleteFragment({ key, type: "shared" })
    })

    test("keeps Fragment keys unique across types", async ({ adapter, expect }) => {
      const key = `fragment-${crypto.randomUUID()}`

      await adapter.addFragment({
        key,
        type: "page",
        data,
        updatedAt: new Date(),
        updatedBy: "test@example.com",
      })

      await expect(
        adapter.addFragment({
          key,
          type: "shared",
          data: sharedData,
          updatedAt: new Date(),
          updatedBy: "test@example.com",
        }),
      ).rejects.toThrow()

      await adapter.deleteFragment({ key, type: "page" })
    })

    test("rejects stale Fragment publishes and deletes", async ({ adapter, expect }) => {
      const key = `fragment-${crypto.randomUUID()}`
      const createdAt = new Date("2026-01-01T00:00:00.000Z")
      const publishedAt = new Date("2026-01-02T00:00:00.000Z")

      await adapter.addFragment({
        key,
        type: "shared",
        data: sharedData,
        updatedAt: createdAt,
        updatedBy: "test@example.com",
      })
      await adapter.updateFragmentData({
        key,
        type: "shared",
        data: sharedData,
        updatedAt: publishedAt,
        updatedBy: "test@example.com",
        expectedUpdatedAt: createdAt,
      })

      const staleWrite = adapter.updateFragmentData({
        key,
        type: "shared",
        data: sharedData,
        updatedAt: new Date("2026-01-03T00:00:00.000Z"),
        updatedBy: "test@example.com",
        expectedUpdatedAt: createdAt,
      })
      await expect(staleWrite).rejects.toThrow(
        new ResponseError("Fragment changed since you loaded it. Reload and try again."),
      )

      await expect(
        adapter.deleteFragment({ key, type: "shared", expectedUpdatedAt: createdAt }),
      ).rejects.toThrow(
        new ResponseError("Fragment changed since you loaded it. Reload and try again."),
      )
      await adapter.deleteFragment({ key, type: "shared", expectedUpdatedAt: publishedAt })
    })
  })
}
