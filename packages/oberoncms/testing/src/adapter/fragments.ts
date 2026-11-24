import { INITIAL_DATA, type OberonFragment } from "@oberoncms/core"

import type { AdapterTestAPI } from "../adapter"

export function testFragments(test: AdapterTestAPI) {
  test.describe("Fragments", { tags: ["ai", "feature-shared-components"] }, () => {
    test.beforeEach(async ({ adapter, skip }) => {
      skip(!("addFragment" in adapter && "getAllFragments" in adapter))
    })

    test("stores typed Fragments with globally unique keys and lightweight metadata", async ({
      adapter,
      expect,
    }) => {
      const page: OberonFragment = {
        key: "/fragment-contract",
        type: "page",
        data: INITIAL_DATA,
        updatedAt: new Date("2026-01-01T00:00:00.123Z"),
        updatedBy: "first@example.com",
      }
      const shared = { ...page, key: "shared-contract", type: "fixture" }
      await adapter.addFragment(page)
      await adapter.addFragment(shared)
      try {
        expect(await adapter.getFragmentData({ key: page.key })).toEqual(INITIAL_DATA)
        expect(await adapter.getFragmentData({ key: shared.key })).toEqual(INITIAL_DATA)
        expect(await adapter.getFragmentData({ key: shared.key, type: "page" })).toBeNull()
        expect(await adapter.getAllFragments({ type: "fixture" })).toEqual([
          {
            key: shared.key,
            type: "fixture",
            updatedAt: page.updatedAt,
            updatedBy: page.updatedBy,
          },
        ])
        const pages = await adapter.getAllFragments({ type: "page" })
        expect(pages).toContainEqual({
          key: page.key,
          type: "page",
          updatedAt: page.updatedAt,
          updatedBy: page.updatedBy,
        })
        expect(pages.every((fragment) => !("data" in fragment))).toBe(true)
        await expect(adapter.addFragment({ ...shared, key: page.key })).rejects.toThrow(
          "already uses the key",
        )
        await expect(adapter.updateFragmentData({ ...shared, key: page.key })).rejects.toThrow(
          "Fragment changed",
        )
      } finally {
        await adapter.deleteFragment({ key: page.key, type: "page" })
        await adapter.deleteFragment({ key: shared.key, type: "fixture" })
      }
    })

    test("updates publication metadata and rejects stale record and graph revisions", async ({
      adapter,
      expect,
    }) => {
      const first: OberonFragment = {
        key: "revision-contract",
        type: "fixture",
        data: INITIAL_DATA,
        updatedAt: new Date("2026-01-01T00:00:00.100Z"),
        updatedBy: "first@example.com",
      }
      await adapter.addFragment(first)
      try {
        const expectedRevision = await adapter.getFragmentRevision()
        const second = {
          ...first,
          data: { ...INITIAL_DATA, root: { props: { title: "Updated" } } },
          updatedAt: new Date("2026-01-01T00:00:00.101Z"),
          updatedBy: "second@example.com",
          expectedUpdatedAt: first.updatedAt,
          expectedRevision,
        }
        await adapter.updateFragmentData(second)
        expect(await adapter.getAllFragments({ type: "fixture" })).toEqual([
          {
            key: first.key,
            type: "fixture",
            updatedAt: second.updatedAt,
            updatedBy: second.updatedBy,
          },
        ])
        await expect(adapter.updateFragmentData(second)).rejects.toThrow("Content changed")
        await expect(
          adapter.updateFragmentData({ ...second, expectedRevision: undefined }),
        ).rejects.toThrow("Fragment changed")
        await expect(
          adapter.deleteFragment({
            key: first.key,
            type: "fixture",
            expectedUpdatedAt: first.updatedAt,
          }),
        ).rejects.toThrow("Fragment changed")
        expect(await adapter.getFragmentData({ key: first.key })).toEqual(second.data)
      } finally {
        await adapter.deleteFragment({ key: first.key, type: "fixture" })
      }
      expect(await adapter.getFragmentData({ key: first.key })).toBeNull()
    })
  })
}
