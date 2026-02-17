export async function* mapConcurrent<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): AsyncGenerator<R, void, void> {
  const resolved: R[] = []
  const inFlight = new Set<Promise<void>>()

  function drain() {
    return resolved.splice(0)
  }

  for (const item of items) {
    const task = fn(item).then((result) => {
      resolved.push(result)
    })

    inFlight.add(task)
    task.then(() => inFlight.delete(task))

    if (inFlight.size >= concurrency) {
      await Promise.race(inFlight)
    }

    yield* drain()
  }

  await Promise.all(inFlight)

  yield* drain()
}
