import { transformProps, type Data } from "@puckeditor/core"
import { mapConcurrent } from "@tohuhono/utils/map-concurrent"

type PropTransform = Parameters<typeof transformProps>[1]

import type {
  OberonClientConfig,
  OberonFragment,
  OberonFragmentMeta,
  TransformResult,
  TransformVersions,
} from "../lib/dtd"

async function applyTransform(
  { key, type }: Pick<OberonFragment, "key" | "type">,
  transforms: PropTransform,
  getFragmentData: (key: string) => Promise<Data | null>,
  updateFragmentData: (data: OberonFragment) => Promise<void>,
): Promise<TransformResult> {
  try {
    const data = await getFragmentData(key)

    if (!data) {
      return {
        type: "transform",
        key,
        status: "success",
      }
    }

    await updateFragmentData({
      key,
      type,
      data: transformProps(data, transforms),
      updatedAt: new Date(),
      updatedBy: "migration",
    })

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
}: {
  transforms: PropTransform
  fragments: OberonFragmentMeta[]
  getFragmentData: (key: string) => Promise<Data | null>
  updateFragmentData: (data: OberonFragment) => Promise<void>
}): AsyncGenerator<TransformResult, void, void> {
  yield* mapConcurrent(
    fragments,
    (fragment) => applyTransform(fragment, transforms, getFragmentData, updateFragmentData),
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
