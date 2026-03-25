import { describe, expect, it } from "@dev/vitest"
import { mapConcurrent } from "./map-concurrent"

async function collect<T>(gen: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = []
  for await (const value of gen) {
    results.push(value)
  }
  return results
}

describe("mapConcurrent", { tags: ["baseline"] }, () => {
  it("processes all items and returns all results", async () => {
    const results = await collect(
      mapConcurrent([1, 2, 3, 4], async (n) => n * 2, 2),
    )
    expect(results.sort((a, b) => a - b)).toEqual([2, 4, 6, 8])
  })

  it("yields nothing for an empty array", async () => {
    const results = await collect(mapConcurrent([], async (n: number) => n, 2))
    expect(results).toEqual([])
  })

  it("respects concurrency limit", async () => {
    let inFlight = 0
    let maxInFlight = 0

    await collect(
      mapConcurrent(
        [1, 2, 3, 4, 5],
        async (n) => {
          inFlight++
          maxInFlight = Math.max(maxInFlight, inFlight)
          await new Promise((resolve) => setTimeout(resolve, 10))
          inFlight--
          return n
        },
        2,
      ),
    )

    expect(maxInFlight).toBeLessThanOrEqual(2)
  })

  it("works with concurrency of 1 (sequential)", async () => {
    const order: number[] = []
    await collect(
      mapConcurrent(
        [1, 2, 3],
        async (n) => {
          order.push(n)
          return n
        },
        1,
      ),
    )
    expect(order).toEqual([1, 2, 3])
  })

  it("yields results before all items are processed", async () => {
    const yielded: number[] = []
    const gen = mapConcurrent(
      [1, 2, 3, 4],
      async (n) => {
        await new Promise((resolve) => setTimeout(resolve, n === 1 ? 0 : 100))
        return n
      },
      4,
    )

    const first = await gen.next()
    if (!first.done) {
      yielded.push(first.value)
    }

    expect(yielded.length).toBeGreaterThan(0)
    expect(yielded[0]).toBe(1)
  })
})
