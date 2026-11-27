export async function waitForServer(url: string, timeout = 120_000) {
  const start = Date.now()
  let lastLog = 0
  let lastFailure = "No response"

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(Math.max(1, timeout - (Date.now() - start))),
      })
      await response.body?.cancel()
      if (response.ok) return true
      lastFailure = `HTTP ${response.status} ${response.statusText}`.trimEnd()
    } catch (error) {
      lastFailure = String(error)
    }

    const elapsed = Date.now() - start

    if (elapsed - lastLog >= 10_000) {
      console.log(`Waiting for ${url}… ${Math.round(elapsed / 1000)}s`)
      lastLog = elapsed
    }
    await new Promise((resolve) => setTimeout(resolve, Math.min(1000, timeout - elapsed)))
  }

  throw new Error(`Server at ${url} was not ready within ${timeout}ms (${lastFailure})`)
}
