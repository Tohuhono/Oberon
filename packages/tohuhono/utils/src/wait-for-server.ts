export async function waitForServer(url: string, timeout = 120_000) {
  const start = Date.now()
  let lastLog = 0

  while (Date.now() - start < timeout) {
    try {
      await fetch(url)
      return true
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const elapsed = Date.now() - start

    if (elapsed - lastLog >= 10_000) {
      console.log(`Waiting for ${url}… ${Math.round(elapsed / 1000)}s`)
      lastLog = elapsed
    }
  }

  throw new Error(`Server did not start within ${timeout}ms`)
}
