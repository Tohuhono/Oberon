import { transformProps, type Config } from "@puckeditor/core"
import { mapConcurrent } from "@tohuhono/utils/map-concurrent"
import { z } from "zod"

import { JsonValueSchema } from "../lib/dtd"
import { getNodeById, isSlotContent } from "../lib/shared-components"

type PropTransform = Parameters<typeof transformProps>[1]

import type {
  OberonClientConfig,
  OberonDatabaseAdapter,
  OberonFragmentMeta,
  TransformResult,
  TransformVersions,
} from "../lib/dtd"

async function applyTransform(
  key: string,
  transforms: PropTransform,
  getFragmentData: OberonDatabaseAdapter["getFragmentData"],
  updateFragmentData: OberonDatabaseAdapter["updateFragmentData"],
  config: Config,
): Promise<TransformResult> {
  try {
    const fragment = await getFragmentData({ key })

    if (!fragment) {
      return {
        type: "transform",
        key,
        status: "success",
      }
    }

    const publication = {
      updatedBy: "migration",
      expectedUpdatedAt: fragment.updatedAt,
    }
    if (fragment.type === "page") {
      await updateFragmentData({
        ...fragment,
        ...publication,
        data: transformProps(fragment.data, transforms, config),
      })
    } else {
      const { tree, defaults, ...data } = fragment.data
      const transformedDefaults = Object.fromEntries(
        Object.entries(defaults).map(([exposureKey, value]) => {
          const exposure = fragment.data.exposures.find((item) => item.key === exposureKey)
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
      await updateFragmentData({
        ...fragment,
        ...publication,
        data: {
          ...data,
          tree: transformProps(tree, transforms, config),
          defaults: z.record(z.string(), JsonValueSchema).parse(transformedDefaults),
        },
      })
    }

    return {
      type: "transform",
      key,
      status: "success",
    }
  } catch (error) {
    console.error(error)
    return {
      type: "transform",
      key,
      status: "error",
    }
  }
}

const MAX_CONCURRENCY = 10

export async function* applyTransforms({
  transforms,
  fragments,
  getFragmentData,
  updateFragmentData,
  config,
}: {
  transforms: PropTransform
  fragments: OberonFragmentMeta[]
  getFragmentData: OberonDatabaseAdapter["getFragmentData"]
  updateFragmentData: OberonDatabaseAdapter["updateFragmentData"]
  config: Config
}): AsyncGenerator<TransformResult, void, void> {
  yield* mapConcurrent(
    fragments,
    ({ key }) => applyTransform(key, transforms, getFragmentData, updateFragmentData, config),
    MAX_CONCURRENCY,
  )
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
