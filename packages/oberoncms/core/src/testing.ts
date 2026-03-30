import { NotImplementedError, type OberonPluginAdapter } from "./lib/dtd"

export * from "./testing/adapter"
export { stubbedAdapter } from "./adapter/stubbed-adapter"

export async function isNotImplemented(
  adapter: Partial<OberonPluginAdapter>,
  methodName: keyof OberonPluginAdapter,
): Promise<boolean> {
  const method = adapter[methodName]

  if (typeof method !== "function") {
    return false
  }

  try {
    await Promise.resolve(Reflect.apply(method, adapter, []))
    return false
  } catch (error) {
    return error instanceof NotImplementedError
  }
}
