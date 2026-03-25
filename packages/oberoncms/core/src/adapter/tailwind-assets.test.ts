import { describe, expect, it } from "@dev/vitest"
import {
  activeTailwindAssetCoversClassList,
  getTailwindAssetDecision,
  mergeTailwindClassLists,
  normalizeTailwindClassList,
} from "./tailwind-assets"

describe("tailwind asset decisions", { tags: ["ai", "issue-314"] }, () => {
  it("normalizes class lists deterministically", () => {
    expect(
      normalizeTailwindClassList(["md:grid", "text-lg", "md:grid", ""]),
    ).toEqual(["md:grid", "text-lg"])
  })

  it("merges class lists across published pages", () => {
    expect(
      mergeTailwindClassLists([
        ["text-lg", "md:grid"],
        ["text-lg", "bg-red-500"],
      ]),
    ).toEqual(["bg-red-500", "md:grid", "text-lg"])
  })

  it("detects when the active asset already covers the effective class set", () => {
    expect(
      activeTailwindAssetCoversClassList({
        activeClassList: ["bg-red-500", "md:grid", "text-lg"],
        effectiveClassList: ["md:grid", "text-lg"],
      }),
    ).toBe(true)
  })

  it("skips compilation when a publish removes classes without adding new ones", () => {
    expect(
      getTailwindAssetDecision({
        activeClassList: ["bg-red-500", "md:grid", "text-lg"],
        publishedClassLists: [["text-lg"]],
        submittedClassList: ["md:grid"],
      }),
    ).toEqual({
      effectiveClassList: ["md:grid", "text-lg"],
      shouldCompile: false,
    })
  })

  it("compiles when a publish introduces a new class", () => {
    expect(
      getTailwindAssetDecision({
        activeClassList: ["md:grid", "text-lg"],
        publishedClassLists: [["text-lg"]],
        submittedClassList: ["bg-red-500", "md:grid"],
      }),
    ).toEqual({
      effectiveClassList: ["bg-red-500", "md:grid", "text-lg"],
      shouldCompile: true,
    })
  })
})
