import { transformProps } from "@puckeditor/core"
import { mapConcurrent } from "@tohuhono/utils/map-concurrent"

type PropTransform = Parameters<typeof transformProps>[1]

import type {
  OberonAdapter,
  OberonClientConfig,
  OberonComponentRecord,
  OberonComponentMeta,
  TransformResult,
  TransformVersions,
} from "../lib/dtd"

async function applyTransform(
  key: string,
  transforms: PropTransform,
  getComponent: (key: string) => Promise<OberonComponentRecord | null>,
  updateComponent: OberonAdapter["updateComponent"],
): Promise<TransformResult> {
  try {
    const component = await getComponent(key)

    if (!component) {
      return {
        type: "transform",
        key,
        status: "success",
      }
    }

    await updateComponent({
      ...component,
      data: transformProps(component.data, transforms),
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
  components,
  getComponent,
  updateComponent,
}: {
  transforms: PropTransform
  components: OberonComponentMeta[]
  getComponent: (key: string) => Promise<OberonComponentRecord | null>
  updateComponent: OberonAdapter["updateComponent"]
}): AsyncGenerator<TransformResult, void, void> {
  yield* mapConcurrent(
    components,
    ({ key }) => applyTransform(key, transforms, getComponent, updateComponent),
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
