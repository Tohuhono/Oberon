import type { PropsWithChildren } from "react"
import { ClassNameValue, twMerge } from "tailwind-merge"

export * as promiseQueue from "./promise-queue"

export type CNProps<T = unknown> = PropsWithChildren<T & { className?: string }>
export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs)
}

/**
 * CAUTION not cryptographically secure or true random
 * Returns a random integer with
 * @param start lower bound
 * @param end upper bound
 */
export function getRandomInt(start: number, end: number) {
  const range = end > start ? end - start : 0
  return Math.floor(Math.random() * (range + 1) + start)
}

export function notImplemented(action: string) {
  return (): never => {
    throw new Error(
      `No oberon plugin provided for ${action} action, please check your oberon adapter configuration.`,
    )
  }
}

/**
 * Returns a promise that resolves after
 * @param ms time in ms
 * Returns a promise that resolves after a random time between
 * @param lower time in ms
 * @param upper time in ms
 */
export function wait(lower: number, upper: number = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, getRandomInt(lower, upper))
  })
}

/*
 * Response chunk for streamed server action
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

/*
 * Wrap a generator function suitable to be returned by a server action
 */
export function streamResponse<T, P extends unknown[] = unknown[]>(
  createGenerator: (...args: P) => AsyncGenerator<T>,
) {
  return async (...args: Parameters<typeof createGenerator>) => {
    const generator = createGenerator(...args)
    return streamChunk<T>(generator)
  }
}

/*
 * Unwrap a streamed server action on the client
 */
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
