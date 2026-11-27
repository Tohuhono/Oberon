import type { OberonPluginAdapter } from "../lib/dtd"

export function componentWrites(adapter: OberonPluginAdapter) {
  const addComponent: OberonPluginAdapter["addComponent"] = async (component) => {
    await adapter.withComponentTransaction(async () => {
      await adapter.addComponent(component)
      await adapter.onComponentWrite()
    })
    await adapter.onComponentChange(component)
  }

  const updateInTransaction: OberonPluginAdapter["updateComponentData"] = async (component) => {
    return adapter.updateComponentData({ ...component, updatedAt: new Date() })
  }

  const updateComponentData: OberonPluginAdapter["updateComponentData"] = async (component) => {
    const updatedAt = await adapter.withComponentTransaction(async () => {
      const persistedAt = await updateInTransaction(component)
      await adapter.onComponentWrite()
      return persistedAt
    })
    await adapter.onComponentChange(component)
    return updatedAt
  }

  const deleteComponent: OberonPluginAdapter["deleteComponent"] = async (component) => {
    await adapter.withComponentTransaction(async () => {
      await adapter.deleteComponent(component)
      await adapter.onComponentWrite()
    })
    await adapter.onComponentChange(component)
  }

  return { addComponent, updateComponentData, deleteComponent, updateInTransaction }
}
