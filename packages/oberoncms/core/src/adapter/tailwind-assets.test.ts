import { fileURLToPath } from "url"
import { describe, expect, it } from "@dev/vitest"
import {
  buildTailwindAsset,
  activeTailwindAssetCoversClassList,
  getTailwindAssetDecision,
  mergeTailwindClassLists,
  normalizeTailwindClassList,
} from "./tailwind-assets"

function getFixturePath(relativePath: string) {
  return fileURLToPath(new URL(relativePath, import.meta.url))
}

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

  it("builds a tailwind asset from the documentation app stylesheet", async () => {
    const asset = await buildTailwindAsset({
      classList: ["text-lg"],
      sourceCssFile: getFixturePath(
        "../../../../../apps/documentation/src/app/app.css",
      ),
    })

    expect(asset.classList).toEqual(["text-lg"])
    expect(asset.css).toContain(".text-lg")
  })

  it("builds a tailwind asset from the playground app stylesheet", async () => {
    const asset = await buildTailwindAsset({
      classList: ["text-lg"],
      sourceCssFile: getFixturePath(
        "../../../../../apps/playground/app/app.css",
      ),
    })

    expect(asset.classList).toEqual(["text-lg"])
    expect(asset.css).toContain(".text-lg")
  })
})
