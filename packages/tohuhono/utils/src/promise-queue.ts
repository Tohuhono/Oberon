type PromiseQueue<T = unknown> = Array<{
  promise: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}>

const queue: PromiseQueue = []
let isPending = false

async function dequeue() {
  if (isPending) {
    return false
  }
  const item = queue.shift()
  if (!item) {
    return false
  }
  try {
    isPending = true
    item
      .promise()
      .then((value) => {
        isPending = false
        item.resolve(value)
        dequeue()
      })
      .catch((err) => {
        isPending = false
        item.reject(err)
        dequeue()
      })
  } catch (err) {
    isPending = false
    item.reject(err)
    dequeue()
  }
  return true
}

export function enqueue<T = unknown>(promise: () => Promise<T>) {
  return new Promise((resolve, reject) => {
    queue.push({
      promise,
      resolve,
      reject,
    })
    dequeue()
  })
}

export async function waitUntilIdle() {
  await enqueue(async () => {})
  if (isPending) {
    await waitUntilIdle()
  }
}
