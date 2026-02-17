import { transformProps, type Data } from "@puckeditor/core"

type PropTransform = Parameters<typeof transformProps>[1]

import type {
  OberonConfig,
  OberonPage,
  OberonPageMeta,
  TransformResult,
  TransformVersions,
} from "../lib/dtd"

async function applyTransform(
  key: string,
  transforms: PropTransform,
  getPageData: (key: string) => Promise<Data | null>,
  updatePageData: (data: OberonPage) => Promise<void>,
): Promise<TransformResult> {
  try {
    const data = await getPageData(key)

    if (!data) {
      return {
        type: "transform",
        key,
        status: "success",
      }
    }

    await updatePageData({
      key,
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

export async function* applyTransforms({
  transforms,
  pages,
  getPageData,
  updatePageData,
}: {
  transforms: PropTransform
  pages: OberonPageMeta[]
  getPageData: (key: string) => Promise<Data | null>
  updatePageData: (data: OberonPage) => Promise<void>
}): AsyncGenerator<TransformResult, void, void> {
  const migrations: Array<Promise<TransformResult>> = []

  for (const { key } of pages) {
    const result = applyTransform(key, transforms, getPageData, updatePageData)
    migrations.push(result)
  }

  for await (const result of migrations) {
    yield result
  }
}

export function getComponentTransformVersions({ components }: OberonConfig) {
  const versions: Record<string, number> = {}

  for (const key in components) {
    const transforms = components[key]?.transforms || []

    versions[key] = transforms.length
  }

  return versions
}

export function getTransforms(
  currentTransformVersions: TransformVersions = {},
  { components }: OberonConfig,
) {
  const componentTransforms: PropTransform = {}

  const transformVersions: TransformVersions = {}

  for (const componentKey in components) {
    const transforms = components[componentKey]?.transforms || []
    const latestTransform = transforms.length
    const previousTransform =
      currentTransformVersions[componentKey] ?? latestTransform

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
