declare global {
  var __oberonTanstackRevalidate: ((path?: string) => Promise<void>) | undefined
}

export async function revalidatePage(path?: string) {
  if (!globalThis.__oberonTanstackRevalidate) {
    throw new Error("Oberon page caching is not initialized. Register the Nitro runtime plugin.")
  }

  await globalThis.__oberonTanstackRevalidate(path)
}
