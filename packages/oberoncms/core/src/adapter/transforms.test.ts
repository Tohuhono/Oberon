import { describe, it, expect } from "vitest"
import { getComponentTransformVersions, getTransforms } from "./transforms"

function config(
  components: Record<
    string,
    {
      transforms?: Array<
        (props: Record<string, unknown>) => Record<string, unknown>
      >
    }
  >,
) {
  return { components } as Parameters<typeof getComponentTransformVersions>[0]
}

describe("getComponentTransformVersions", () => {
  it("returns 0 for components with no transforms", () => {
    expect(getComponentTransformVersions(config({ Hero: {} }))).toEqual({
      Hero: 0,
    })
  })

  it("counts transforms per component", () => {
    const identity = (p: Record<string, unknown>) => p
    expect(
      getComponentTransformVersions(
        config({
          Hero: { transforms: [identity, identity] },
          Card: { transforms: [identity] },
          Footer: {},
        }),
      ),
    ).toEqual({ Hero: 2, Card: 1, Footer: 0 })
  })

  it("returns empty object for empty components", () => {
    expect(getComponentTransformVersions(config({}))).toEqual({})
  })
})

describe("getTransforms", () => {
  const addTitle = (props: Record<string, unknown>) => ({
    ...props,
    title: "default",
  })
  const uppercase = (props: Record<string, unknown>) => ({
    ...props,
    title: String(props.title ?? "").toUpperCase(),
  })

  it("returns false for transforms when all versions are current", () => {
    const result = getTransforms(
      { Hero: 1 },
      config({ Hero: { transforms: [addTitle] } }),
    )
    expect(result.transforms).toBe(false)
    expect(result.components).toEqual({ Hero: 1 })
  })

  it("builds transform for components behind current version", () => {
    const result = getTransforms(
      { Hero: 0 },
      config({ Hero: { transforms: [addTitle, uppercase] } }),
    )
    expect(result.components).toEqual({ Hero: 2 })
    expect(result.transforms).toBeTruthy()

    // Apply the transform pipeline
    const transformed = result.transforms && result.transforms.Hero?.({})
    expect(transformed).toEqual({ title: "DEFAULT" })
  })

  it("applies only new transforms (skips already-applied ones)", () => {
    const result = getTransforms(
      { Hero: 1 },
      config({ Hero: { transforms: [addTitle, uppercase] } }),
    )
    expect(result.transforms).toBeTruthy()

    // Only uppercase should run (index 1), not addTitle (index 0)
    const transformed =
      result.transforms && result.transforms.Hero?.({ title: "hello" })
    expect(transformed).toEqual({ title: "HELLO" })
  })

  it("treats missing version as latest (no migration needed for new components)", () => {
    const result = getTransforms(
      {},
      config({ Hero: { transforms: [addTitle] } }),
    )
    expect(result.transforms).toBe(false)
    expect(result.components).toEqual({ Hero: 1 })
  })

  it("handles mix of current and outdated components", () => {
    const result = getTransforms(
      { Hero: 1, Card: 0 },
      config({
        Hero: { transforms: [addTitle] },
        Card: { transforms: [addTitle] },
      }),
    )
    expect(result.components).toEqual({ Hero: 1, Card: 1 })
    expect(result.transforms).toBeTruthy()
    // Only Card needs migration
    expect(result.transforms && "Hero" in result.transforms).toBe(false)
    expect(result.transforms && "Card" in result.transforms).toBe(true)
  })

  it("chains multiple pending transforms in order", () => {
    const step1 = (props: Record<string, unknown>) => ({ ...props, a: 1 })
    const step2 = (props: Record<string, unknown>) => ({ ...props, b: 2 })
    const step3 = (props: Record<string, unknown>) => ({ ...props, c: 3 })

    const result = getTransforms(
      { Hero: 1 },
      config({ Hero: { transforms: [step1, step2, step3] } }),
    )

    const transformed = result.transforms && result.transforms.Hero?.({})
    expect(transformed).toEqual({ b: 2, c: 3 })
  })
})
