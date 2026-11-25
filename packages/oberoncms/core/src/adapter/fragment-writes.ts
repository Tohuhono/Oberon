import { createElement } from "react"

import { withSharedComponent } from "../components/shared-component-render"
import {
  ResponseError,
  type OberonClientConfig,
  type OberonFragment,
  type OberonPluginAdapter,
} from "../lib/dtd"
import {
  findSharedReferences,
  getSharedComponentLibrary,
  validateSharedComponent,
} from "../lib/shared-components"

const render = () => createElement("div")

export function fragmentWrites(adapter: OberonPluginAdapter, config: OberonClientConfig) {
  const prepare = async (fragment: OberonFragment) => {
    if (
      fragment.type === "page" &&
      !findSharedReferences(fragment.data, withSharedComponent(config, render)).length
    )
      return

    const library = await getSharedComponentLibrary(adapter)
    if (fragment.type === "shared") {
      try {
        const sharedConfig = withSharedComponent(config, render, {
          ...library,
          [fragment.key]: fragment.data,
        })
        validateSharedComponent(fragment.key, fragment.data, library, sharedConfig)
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
      const missing = findSharedReferences(fragment.data, sharedConfig).filter(
        (key) => !Object.hasOwn(library, key),
      )
      if (missing.length) {
        throw new ResponseError(`Missing Shared components: ${missing.join(", ")}.`)
      }
    }
  }

  const addFragment: OberonPluginAdapter["addFragment"] = async (fragment) => {
    await adapter.withFragmentTransaction(async () => {
      await prepare(fragment)
      await adapter.addFragment(fragment)
      await adapter.onFragmentWrite()
    })
    await adapter.onFragmentChange(fragment)
  }

  const updateInTransaction: OberonPluginAdapter["updateFragmentData"] = async (fragment) => {
    await prepare(fragment)
    return adapter.updateFragmentData({ ...fragment, updatedAt: new Date() })
  }

  const updateFragmentData: OberonPluginAdapter["updateFragmentData"] = async (fragment) => {
    const updatedAt = await adapter.withFragmentTransaction(async () => {
      const persistedAt = await updateInTransaction(fragment)
      await adapter.onFragmentWrite()
      return persistedAt
    })
    await adapter.onFragmentChange(fragment)
    return updatedAt
  }

  const deleteFragment: OberonPluginAdapter["deleteFragment"] = async (fragment) => {
    await adapter.withFragmentTransaction(async () => {
      if (fragment.type === "shared") {
        const library = await getSharedComponentLibrary(adapter)
        const sharedConfig = withSharedComponent(config, render, library)
        const consumers = Object.entries(library)
          .filter(
            ([key, source]) =>
              key !== fragment.key &&
              findSharedReferences(source.tree, sharedConfig, source.defaults).includes(
                fragment.key,
              ),
          )
          .map(([key]) => key)

        for (const { key } of await adapter.getAllFragments("page")) {
          const page = await adapter.getFragmentData({ key })
          if (
            page?.type === "page" &&
            findSharedReferences(page.data, sharedConfig).includes(fragment.key)
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

      await adapter.deleteFragment(fragment)
      await adapter.onFragmentWrite()
    })
    await adapter.onFragmentChange(fragment)
  }

  return { addFragment, updateFragmentData, deleteFragment, updateInTransaction }
}
