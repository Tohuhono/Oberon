import { createElement } from "react"

import { withSharedComponent } from "../components/shared-component-render"
import {
  ResponseError,
  type OberonClientConfig,
  type OberonComponentRecord,
  type OberonPluginAdapter,
} from "../lib/dtd"
import {
  findSharedReferences,
  getSharedComponentLibrary,
  validateSharedComponent,
} from "../lib/shared-components"

const render = () => createElement("div")

export function componentWrites(adapter: OberonPluginAdapter, config: OberonClientConfig) {
  const prepare = async (component: OberonComponentRecord) => {
    if (
      component.type === "page" &&
      !findSharedReferences(component.data, withSharedComponent(config, render)).length
    )
      return

    const library = await getSharedComponentLibrary(adapter)
    if (component.type === "shared") {
      try {
        const sharedConfig = withSharedComponent(config, render, {
          ...library,
          [component.key]: component.data,
        })
        validateSharedComponent(component.key, component.data, library, sharedConfig)
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith("Could not find component config for ")
        ) {
          throw new ResponseError(error.message)
        }
        throw error
      }
    } else {
      const sharedConfig = withSharedComponent(config, render, library)
      const missing = findSharedReferences(component.data, sharedConfig).filter(
        (key) => !Object.hasOwn(library, key),
      )
      if (missing.length) {
        throw new ResponseError(`Missing Shared components: ${missing.join(", ")}.`)
      }
    }
  }

  const addComponent: OberonPluginAdapter["addComponent"] = async (component) => {
    await adapter.withComponentTransaction(async () => {
      await prepare(component)
      await adapter.addComponent(component)
      await adapter.onComponentWrite()
    })
    await adapter.onComponentChange(component)
  }

  const updateInTransaction: OberonPluginAdapter["updateComponentData"] = async (component) => {
    await prepare(component)
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
      if (component.type === "shared") {
        const library = await getSharedComponentLibrary(adapter)
        const sharedConfig = withSharedComponent(config, render, library)
        const consumers = Object.entries(library)
          .filter(
            ([key, source]) =>
              key !== component.key &&
              findSharedReferences(source.tree, sharedConfig, source.defaults).includes(
                component.key,
              ),
          )
          .map(([key]) => key)

        for (const { key } of await adapter.listComponents("page")) {
          const page = await adapter.getComponent({ key })
          if (
            page?.type === "page" &&
            findSharedReferences(page.data, sharedConfig).includes(component.key)
          ) {
            consumers.push(key)
          }
        }

        if (consumers.length) {
          throw new ResponseError(
            `Cannot delete this Shared component because it is used by: ${consumers.join(", ")}.`,
          )
        }
      }

      await adapter.deleteComponent(component)
      await adapter.onComponentWrite()
    })
    await adapter.onComponentChange(component)
  }

  return { addComponent, updateComponentData, deleteComponent, updateInTransaction }
}
