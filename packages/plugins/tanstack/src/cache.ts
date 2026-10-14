export async function getPageCacheRevision() {
  const { useStorage } = await import("nitro/storage")
  return useStorage("cache:oberon").getItem<string>("revision")
}

export async function invalidatePageCache() {
  const { useStorage } = await import("nitro/storage")
  await useStorage("cache:oberon").setItem("revision", crypto.randomUUID())
}
