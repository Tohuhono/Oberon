import { ResponseError } from "@oberoncms/core"

import type { AdapterTestAPI } from "../adapter"

const data = {
  content: [{ type: "Text", props: { id: "text", text: "Component" } }],
  root: { props: { title: "Component" } },
}

export function testComponents(test: AdapterTestAPI) {
  test.describe("Components", () => {
    test.beforeEach(async ({ adapter, skip }) => {
      skip(
        !(
          "addComponent" in adapter &&
          "deleteComponent" in adapter &&
          "listComponents" in adapter &&
          "getComponent" in adapter &&
          "updateComponentData" in adapter
        ),
      )
    })

    test("lists metadata by type and reads data by key", async ({ adapter, expect }) => {
      const key = `/component-${crypto.randomUUID()}`
      const updatedAt = new Date("2026-01-01T00:00:00.000Z")

      await adapter.addComponent({
        key,
        type: "page",
        data,
        updatedAt,
        updatedBy: "test@example.com",
      })

      await expect(adapter.listComponents("page")).resolves.toContainEqual({
        key,
        type: "page",
        updatedAt,
        updatedBy: "test@example.com",
      })
      await expect(adapter.getComponent({ key })).resolves.toMatchObject({
        key,
        type: "page",
        data,
        updatedAt,
        updatedBy: "test@example.com",
      })

      await adapter.deleteComponent({ key, type: "page" })
    })

    test("rejects a duplicate Component key", async ({ adapter, expect }) => {
      const key = `/component-${crypto.randomUUID()}`

      await adapter.addComponent({
        key,
        type: "page",
        data,
        updatedAt: new Date(),
        updatedBy: "test@example.com",
      })

      await expect(
        adapter.addComponent({
          key,
          type: "page",
          data,
          updatedAt: new Date(),
          updatedBy: "test@example.com",
        }),
      ).rejects.toThrow()

      await adapter.deleteComponent({ key, type: "page" })
    })

    test("rejects stale Component publishes and deletes", async ({ adapter, expect }) => {
      const key = `/component-${crypto.randomUUID()}`
      const createdAt = new Date("2026-01-01T00:00:00.000Z")

      await adapter.addComponent({
        key,
        type: "page",
        data,
        updatedAt: createdAt,
        updatedBy: "test@example.com",
      })
      const publishedAt = await adapter.updateComponentData({
        key,
        type: "page",
        data,
        updatedAt: createdAt,
        updatedBy: "test@example.com",
        expectedUpdatedAt: createdAt,
      })

      expect(publishedAt.getTime()).toBeGreaterThan(createdAt.getTime())

      const staleWrite = adapter.updateComponentData({
        key,
        type: "page",
        data,
        updatedAt: new Date("2026-01-03T00:00:00.000Z"),
        updatedBy: "test@example.com",
        expectedUpdatedAt: createdAt,
      })
      await expect(staleWrite).rejects.toThrow(
        new ResponseError("Component changed since you loaded it. Reload and try again."),
      )

      await expect(
        adapter.deleteComponent({ key, type: "page", expectedUpdatedAt: createdAt }),
      ).rejects.toThrow(
        new ResponseError("Component changed since you loaded it. Reload and try again."),
      )
      await adapter.deleteComponent({ key, type: "page", expectedUpdatedAt: publishedAt })
    })
  })
}
