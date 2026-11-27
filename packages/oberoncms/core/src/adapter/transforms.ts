import { transformProps, type Config } from "@puckeditor/core"
import { createElement } from "react"
import { z } from "zod"

import { withSharedComponent } from "../components/shared-component-render"
import {
  JsonValueSchema,
  type MigrationResult,
  type OberonClientConfig,
  type OberonAdapter,
  type OberonComponentRecord,
  type OberonComponentMeta,
  type OberonPluginAdapter,
  type OberonUser,
  type TransformResult,
  type TransformVersions,
} from "../lib/dtd"
import { getNodeById, getSharedComponentLibrary, isSlotContent } from "../lib/shared-components"

type PropTransform = Parameters<typeof transformProps>[1]

function transformComponent(
  component: OberonComponentRecord,
  transforms: PropTransform,
  config: Config,
) {
  if (component.type === "page") {
    return { ...component, data: transformProps(component.data, transforms, config) }
  }

  const { tree, defaults, exposures, name } = component.data
  const transformedDefaults = Object.fromEntries(
    Object.entries(defaults).map(([exposureKey, value]) => {
      const exposure = exposures.find((item) => item.key === exposureKey)
      const node = exposure && getNodeById(tree, config, exposure.nodeId)
      const field = exposure && node && config.components[node.type]?.fields?.[exposure.prop]
      return [
        exposureKey,
        field?.type === "slot" && isSlotContent(value)
          ? transformProps({ root: {}, content: value }, transforms, config).content
          : value,
      ]
    }),
  )
  return {
    ...component,
    data: {
      name,
      exposures,
      tree: transformProps(tree, transforms, config),
      defaults: z.record(z.string(), JsonValueSchema).parse(transformedDefaults),
    },
  }
}

export async function* migrateComponents(
  adapter: OberonPluginAdapter,
  config: OberonClientConfig,
  user: OberonUser,
  updateComponent: OberonAdapter["updateComponent"],
): AsyncGenerator<TransformResult | MigrationResult> {
  let storedComponents: OberonComponentMeta[] = []
  let status: TransformResult["status"] = "success"
  try {
    await adapter.withComponentTransaction(async () => {
      const site = await adapter.getSite()
      const { components, transforms } = getTransforms(site?.components, config)
      if (!transforms) return

      storedComponents = [
        ...(await adapter.listComponents("page")),
        ...(await adapter.listComponents("shared")),
      ]
      const transformConfig = withSharedComponent(
        config,
        () => createElement("div"),
        await getSharedComponentLibrary(adapter),
      )

      for (const { key } of storedComponents) {
        const component = await adapter.getComponent({ key })
        if (!component) continue
        await updateComponent({
          ...transformComponent(component, transforms, transformConfig),
          expectedUpdatedAt: component.updatedAt,
          updatedBy: user.email,
        })
      }

      await adapter.updateSite({
        version: config.version,
        components,
        updatedAt: new Date(),
        updatedBy: user.email,
      })
      if (storedComponents.length) await adapter.onComponentWrite()
    })
  } catch (error) {
    console.error(error)
    status = "error"
  }

  const summary: MigrationResult = {
    type: "summary",
    total: storedComponents.length,
    error: [],
    success: [],
  }
  for (const component of storedComponents) {
    if (status === "success") await adapter.onComponentChange(component)
    summary[status].push(component.key)
    yield { type: "transform", key: component.key, status }
  }
  yield summary
}

export function getComponentTransformVersions({ components }: OberonClientConfig) {
  const versions: Record<string, number> = {}

  for (const key in components) {
    const transforms = components[key]?.transforms || []

    versions[key] = transforms.length
  }

  return versions
}

export function getTransforms(
  currentTransformVersions: TransformVersions = {},
  { components }: OberonClientConfig,
) {
  const componentTransforms: PropTransform = {}

  const transformVersions: TransformVersions = {}

  for (const componentKey in components) {
    const transforms = components[componentKey]?.transforms || []
    const latestTransform = transforms.length
    const previousTransform = currentTransformVersions[componentKey] ?? latestTransform

    if (previousTransform < latestTransform) {
      componentTransforms[componentKey] = (props: Record<string, unknown>) =>
        transforms
          .slice(previousTransform)
          .reduce((accumulater, transform) => transform(accumulater), props)
    }

    transformVersions[componentKey] = latestTransform
  }

  const hasTransforms = !!Object.keys(componentTransforms).length

  return {
    components: transformVersions,
    transforms: hasTransforms && componentTransforms,
  }
}
