import { ResponseError } from "@oberoncms/core"

import type { AdapterTestAPI } from "../adapter"

const data = {
  content: [{ type: "Text", props: { id: "text", text: "Component" } }],
  root: { props: { title: "Component" } },
}
const sharedData = { name: "Component", tree: data, exposures: [], defaults: {} }

export function testComponents(test: AdapterTestAPI) {
  test.describe("Components", () => {
    test.beforeEach(async ({ adapter, skip }) => {
      skip(
        !(
          "addComponent" in adapter &&
          "deleteComponent" in adapter &&
          "listComponents" in adapter &&
          "getComponent" in adapter &&
          "updateComponent" in adapter
        ),
      )
    })

    test("lists metadata by type and reads data by key", async ({ adapter, expect }) => {
      const key = `component-${crypto.randomUUID()}`
      const updatedAt = new Date("2026-01-01T00:00:00.000Z")

      await adapter.addComponent({
        key,
        type: "shared",
        data: sharedData,
        updatedAt,
        updatedBy: "test@example.com",
      })

      await expect(adapter.listComponents("page")).resolves.not.toContainEqual(
        expect.objectContaining({ key }),
      )
      await expect(adapter.listComponents("shared")).resolves.toContainEqual({
        key,
        type: "shared",
        updatedAt,
        updatedBy: "test@example.com",
      })
      await expect(adapter.getComponent({ key })).resolves.toMatchObject({
        key,
        type: "shared",
        data: sharedData,
        updatedAt,
        updatedBy: "test@example.com",
      })

      await adapter.deleteComponent({ key })
    })

    test("keeps Component keys unique across types", async ({ adapter, expect }) => {
      const key = `component-${crypto.randomUUID()}`

      await adapter.addComponent({
        key,
        type: "page",
        data,
        updatedAt: new Date(),
        updatedBy: "test@example.com",
      })

      await expect(
        adapter.updateComponent({
          key,
          type: "shared",
          data: sharedData,
          updatedAt: new Date(),
          updatedBy: "test@example.com",
        }),
      ).rejects.toThrow(
        new ResponseError("A Component with this key already exists with a different type."),
      )

      await expect(adapter.getComponent({ key })).resolves.toMatchObject({ key, type: "page" })
      await adapter.deleteComponent({ key })
    })

    test("rejects stale Component publishes and deletes", async ({ adapter, expect }) => {
      const key = `component-${crypto.randomUUID()}`
      const createdAt = new Date("2026-01-01T00:00:00.000Z")

      await adapter.addComponent({
        key,
        type: "shared",
        data: sharedData,
        updatedAt: createdAt,
        updatedBy: "test@example.com",
      })
      const publishedAt = await adapter.updateComponent({
        key,
        type: "shared",
        data: sharedData,
        updatedAt: createdAt,
        updatedBy: "test@example.com",
        expectedUpdatedAt: createdAt,
      })

      expect(publishedAt.getTime()).toBeGreaterThan(createdAt.getTime())

      const staleWrite = adapter.updateComponent({
        key,
        type: "shared",
        data: sharedData,
        updatedAt: new Date("2026-01-03T00:00:00.000Z"),
        updatedBy: "test@example.com",
        expectedUpdatedAt: createdAt,
      })
      await expect(staleWrite).rejects.toThrow(
        new ResponseError("Component changed since you loaded it. Reload and try again."),
      )

      await expect(adapter.deleteComponent({ key, expectedUpdatedAt: createdAt })).rejects.toThrow(
        new ResponseError("Component changed since you loaded it. Reload and try again."),
      )
      await adapter.deleteComponent({ key, expectedUpdatedAt: publishedAt })
    })
  })
}
