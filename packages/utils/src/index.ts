import type { PropsWithChildren } from "react"
import { ClassNameValue, twMerge } from "tailwind-merge"

export type CNProps<T = unknown> = PropsWithChildren<T & { className?: string }>
export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs)
}

/**
 * Returns a promise that resolves after @param ms
 */
export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Returns a random integer with
 * CAUTION not cryptographically secure or truelly random
 * @param start lower bound
 * @param range
 */
export function getRandomInt(start: number, range: number) {
  return Math.floor(Math.random() * range + start)
}

/*
 * Generate streamed responses for server actions
 */
export type StreamResponseChunk<T, R = void> = {
  iteratorResult: IteratorResult<T, R>
  next?: Promise<StreamResponseChunk<T, R>>
}

async function streamChunk<T, R = void>(generator: AsyncGenerator<T, R>) {
  const next = generator.next()
  return new Promise<StreamResponseChunk<T, R>>((resolve, reject) => {
    next.then((res) => {
      if (res.done) {
        resolve({ iteratorResult: res })
      } else {
        resolve({ iteratorResult: res, next: streamChunk(generator) })
      }
    })
    next.catch((error) => reject(error))
  })
}

export function streamResponse<T, P extends unknown[] = unknown[]>(
  createGenerator: (...args: P) => AsyncGenerator<T>,
) {
  return async (...args: Parameters<typeof createGenerator>) => {
    const generator = createGenerator(...args)
    return streamChunk<T>(generator)
  }
}

export function iterateStreamResponse<T>(
  streamResponse: Promise<StreamResponseChunk<T>>,
) {
  return {
    [Symbol.asyncIterator]: function () {
      return {
        current: streamResponse,
        async next() {
          const { iteratorResult, next } = await this.current
          if (next) {
            this.current = next
          } else {
            iteratorResult.done = true
          }

          return iteratorResult
        },
      }
    },
  }
}
