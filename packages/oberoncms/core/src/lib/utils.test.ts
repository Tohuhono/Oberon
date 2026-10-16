import { describe, expect, it } from "@dev/vitest"

import { pageTag } from "../index"

describe("pageTag", { tags: ["ai", "issue-381"] }, () => {
  it.each([
    ["/", "oberon-page-8a5edab282632443219e051e4ade2d1d5bbc671c781051bf1437897cbdfea0f1"],
    ["/about", "oberon-page-979bddc4a8caafdda41370de2a2e0781a1af2f53c9f36fb804df9af860a53cf5"],
    ["/café,news", "oberon-page-3ea98e632d46730e502a4890242d641273b7b1cbf958d7df10add4ff950eaaf7"],
  ])("returns a stable cache tag for %s", async (key, expected) => {
    await expect(pageTag(key)).resolves.toBe(expected)
    await expect(pageTag(key)).resolves.toBe(expected)
  })
})
