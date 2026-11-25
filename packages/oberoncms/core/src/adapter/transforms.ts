import { transformProps, type Config } from "@puckeditor/core"
import { createElement } from "react"
import { z } from "zod"

import { withSharedComponent } from "../components/shared-component-render"
import {
  JsonValueSchema,
  type MigrationResult,
  type OberonClientConfig,
  type OberonDatabaseAdapter,
  type OberonFragment,
  type OberonFragmentMeta,
  type OberonPluginAdapter,
  type OberonUser,
  type TransformResult,
  type TransformVersions,
} from "../lib/dtd"
import { getNodeById, getSharedComponentLibrary, isSlotContent } from "../lib/shared-components"

type PropTransform = Parameters<typeof transformProps>[1]

function transformFragment(fragment: OberonFragment, transforms: PropTransform, config: Config) {
  if (fragment.type === "page") {
    return { ...fragment, data: transformProps(fragment.data, transforms, config) }
  }

  const { tree, defaults, exposures, name } = fragment.data
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
    ...fragment,
    data: {
      name,
      exposures,
      tree: transformProps(tree, transforms, config),
      defaults: z.record(z.string(), JsonValueSchema).parse(transformedDefaults),
    },
  }
}

export async function* migrateFragments(
  adapter: OberonPluginAdapter,
  config: OberonClientConfig,
  user: OberonUser,
  updateFragment: OberonDatabaseAdapter["updateFragmentData"],
): AsyncGenerator<TransformResult | MigrationResult> {
  let fragments: OberonFragmentMeta[] = []
  let status: TransformResult["status"] = "success"
  try {
    await adapter.withFragmentTransaction(async () => {
      const site = await adapter.getSite()
      const { components, transforms } = getTransforms(site?.components, config)
      if (!transforms) return

      fragments = [
        ...(await adapter.getAllFragments("page")),
        ...(await adapter.getAllFragments("shared")),
      ]
      const transformConfig = withSharedComponent(
        config,
        () => createElement("div"),
        await getSharedComponentLibrary(adapter),
      )

      for (const { key } of fragments) {
        const fragment = await adapter.getFragmentData({ key })
        if (!fragment) continue
        await updateFragment({
          ...transformFragment(fragment, transforms, transformConfig),
          expectedUpdatedAt: fragment.updatedAt,
          updatedBy: user.email,
        })
      }

      await adapter.updateSite({
        version: config.version,
        components,
        updatedAt: new Date(),
        updatedBy: user.email,
      })
      if (fragments.length) await adapter.onFragmentWrite()
    })
  } catch (error) {
    console.error(error)
    status = "error"
  }

  const summary: MigrationResult = {
    type: "summary",
    total: fragments.length,
    error: [],
    success: [],
  }
  for (const fragment of fragments) {
    if (status === "success") await adapter.onFragmentChange(fragment)
    summary[status].push(fragment.key)
    yield { type: "transform", key: fragment.key, status }
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
