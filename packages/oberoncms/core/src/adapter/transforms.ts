import { transformProps } from "@puckeditor/core"

import {
  type MigrationResult,
  type OberonClientConfig,
  type OberonDatabaseAdapter,
  type OberonComponentMeta,
  type OberonPluginAdapter,
  type OberonUser,
  type TransformResult,
  type TransformVersions,
} from "../lib/dtd"

type PropTransform = Parameters<typeof transformProps>[1]

export async function* migrateComponents(
  adapter: OberonPluginAdapter,
  config: OberonClientConfig,
  user: OberonUser,
  updateComponent: OberonDatabaseAdapter["updateComponentData"],
): AsyncGenerator<TransformResult | MigrationResult> {
  let storedComponents: OberonComponentMeta[] = []
  let status: TransformResult["status"] = "success"
  try {
    await adapter.withComponentTransaction(async () => {
      const site = await adapter.getSite()
      const { components, transforms } = getTransforms(site?.components, config)
      if (!transforms) return

      storedComponents = await adapter.listComponents("page")

      for (const { key } of storedComponents) {
        const component = await adapter.getComponent({ key })
        if (!component) continue
        await updateComponent({
          ...component,
          data: transformProps(component.data, transforms, config),
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
