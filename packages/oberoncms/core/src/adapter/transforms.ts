// TODO fix types here
// TODO raise issue to export separately to avoid client errors
/* eslint-disable @typescript-eslint/no-explicit-any */
/* ****************************************************
 * Start copy from @measured/puck
 */
import type {
  DefaultComponentProps,
  DefaultRootProps,
  Data,
} from "@measured/puck"

type PropTransform<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultRootProps = DefaultRootProps,
> = Partial<
  {
    [ComponentName in keyof Props]: (
      props: Props[ComponentName] & { [key: string]: any },
    ) => Props[ComponentName]
  } & { root: (props: RootProps & { [key: string]: any }) => RootProps }
>

export async function transformProps<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultRootProps = DefaultRootProps,
>(data: Data, propTransforms: PropTransform<Props, RootProps>): Promise<Data> {
  const mapItem = async (item: any) => {
    if (propTransforms[item.type]) {
      return {
        ...item,
        props: await propTransforms[item.type]?.(item.props),
      }
    }

    return item
  }

  const root = propTransforms["root"]
    ? propTransforms["root"](data.root as RootProps)
    : data.root

  const afterPropTransforms: Data = {
    ...data,
    root,
    content: await Promise.all(data.content.map(mapItem)),
    zones: await Object.keys(data.zones || {}).reduce(async (acc, zoneKey) => {
      const zone = data.zones?.[zoneKey]
      if (!zone) {
        return acc
      }

      return {
        ...acc,
        [zoneKey]: await Promise.all(zone.map(mapItem)),
      }
    }, Promise.resolve({})),
  }

  return afterPropTransforms
}
/* ****************************************************
 * End copy from @measured/puck
 */

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
      data: await transformProps(data, transforms),
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
      componentTransforms[componentKey] = (props) =>
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
