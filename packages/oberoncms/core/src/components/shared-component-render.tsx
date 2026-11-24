import { migrate, walkTree, type Config, type Data, type Metadata } from "@puckeditor/core"
import type { ReactElement } from "react"

import { SharedComponentDataSchema, type SharedComponentData, ResponseError } from "../lib/dtd"
import {
  getNodeById,
  getSharedInstanceDefaults,
  SHARED_COMPONENT_TYPE,
} from "../lib/shared-components"

type SharedComponentLibrary = Record<string, SharedComponentData>

type SharedTreeRenderer = (props: {
  config: Config
  data: Data
  metadata: Metadata
}) => ReactElement

type PuckFieldConfig = NonNullable<Config["components"][string]["fields"]>[string]

function isSlotField(value: unknown): value is PuckFieldConfig & { type: "slot" } {
  return typeof value === "object" && value !== null && "type" in value && value.type === "slot"
}

function isSharedComponentLibrary(value: unknown): value is SharedComponentLibrary {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((source) => SharedComponentDataSchema.safeParse(source).success)
  )
}

function isComponentData(value: unknown): value is Data["content"][number] {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string" &&
    "props" in value &&
    typeof value.props === "object" &&
    value.props !== null
  )
}

function stripUnusedSharedExposureProps(
  data: Data,
  allExposureKeys: Set<string>,
  exposureKeysByDefinitionId: Map<string, Set<string>>,
) {
  const mapNode = (node: Data["content"][number]): Data["content"][number] => {
    const definitionId =
      node.type === SHARED_COMPONENT_TYPE && typeof node.props.definitionId === "string"
        ? node.props.definitionId
        : undefined
    const allowedExposureKeys =
      (definitionId && exposureKeysByDefinitionId.get(definitionId)) ?? new Set<string>()
    const unusedExposureKeys = new Set(
      [...allExposureKeys].filter((key) => !allowedExposureKeys.has(key)),
    )
    const props = Object.fromEntries(
      Object.entries(node.props).filter(([key]) => !unusedExposureKeys.has(key)),
    )
    let changed = Object.keys(props).length !== Object.keys(node.props).length

    for (const [key, value] of Object.entries(props)) {
      if (Array.isArray(value) && value.every((item) => isComponentData(item))) {
        const children = value.map((child) => mapNode(child))
        if (children.some((child, index) => child !== value[index])) {
          props[key] = children
          changed = true
        }
      }
    }

    return changed ? { ...node, props } : node
  }

  return { ...data, content: data.content.map(mapNode) }
}

function renderSharedSource(
  definitionId: string,
  instanceId: string,
  props: Record<string, unknown>,
  metadata: Metadata,
  config: Config,
  renderTree: SharedTreeRenderer,
) {
  const metadataLibrary: unknown = metadata.sharedComponents
  if (!isSharedComponentLibrary(metadataLibrary)) {
    throw new ResponseError("The Shared component library is missing from render metadata.")
  }

  const source = metadataLibrary[definitionId]
  if (!source) {
    throw new ResponseError(`Shared component "${definitionId}" is no longer available.`)
  }

  return renderTree({
    config,
    data: resolveSharedInstanceData(source, props, config, instanceId),
    metadata,
  })
}

function resolveSharedInstanceData(
  source: SharedComponentData,
  props: Record<string, unknown>,
  config: Config,
  instanceId: string,
) {
  const exposedProps = new Map<string, typeof source.exposures>()
  for (const exposure of source.exposures) {
    exposedProps.set(exposure.nodeId, [...(exposedProps.get(exposure.nodeId) ?? []), exposure])
  }
  const data = migrate(source.tree, config)

  return walkTree(data, config, (content) =>
    content.map((node) => {
      const nodeId = node.props.id
      const nodeProps = { ...node.props }

      if (typeof nodeId === "string") {
        nodeProps.id = `${instanceId}__${nodeId}`
      }

      for (const exposure of typeof nodeId === "string" ? (exposedProps.get(nodeId) ?? []) : []) {
        if (Object.hasOwn(props, exposure.key)) {
          nodeProps[exposure.prop] = props[exposure.key]
        }
      }

      return { ...node, props: nodeProps }
    }),
  )
}

export function withSharedComponent(
  config: Config,
  renderTree: SharedTreeRenderer,
  library: SharedComponentLibrary = {},
): Config {
  const fields: NonNullable<Config["components"][string]["fields"]> = {
    definitionId: { type: "text", label: "Definition ID" },
  }
  for (const source of Object.values(library)) {
    const tree = migrate(source.tree, config)
    for (const exposure of source.exposures) {
      const node = getNodeById(tree, config, exposure.nodeId)
      const field = node && config.components[node.type]?.fields?.[exposure.prop]
      if (isSlotField(field)) {
        fields[exposure.key] = field
      }
    }
  }

  const sharedConfig: Config = {
    ...config,
    components: { ...config.components },
  }

  sharedConfig.components[SHARED_COMPONENT_TYPE] = {
    label: "Shared component",
    fields,
    render: ({ definitionId, id, puck, ...instanceProps }) => {
      if (typeof definitionId !== "string" || typeof id !== "string") {
        throw new ResponseError("The Shared component instance is missing its identity.")
      }

      return renderSharedSource(
        definitionId,
        id,
        instanceProps,
        puck.metadata,
        sharedConfig,
        renderTree,
      )
    },
  }

  return sharedConfig
}

export function withSharedEditorComponents(
  config: Config,
  library: SharedComponentLibrary,
  renderTree: SharedTreeRenderer,
) {
  const sessionConfig = withSharedComponent(config, renderTree, library)
  const aliasesByDefinitionId = new Map<string, string>()
  const definitionIdsByAlias = new Map<string, string>()

  for (const [definitionId, source] of Object.entries(library)) {
    const alias = `SharedPalette_${encodeURIComponent(definitionId)}`
    aliasesByDefinitionId.set(definitionId, alias)
    definitionIdsByAlias.set(alias, definitionId)

    const fields: NonNullable<Config["components"][string]["fields"]> = {}
    const migratedTree = migrate(source.tree, sessionConfig)
    for (const exposure of source.exposures) {
      const node = getNodeById(migratedTree, sessionConfig, exposure.nodeId)
      const field = node && sessionConfig.components[node.type]?.fields?.[exposure.prop]
      if (field) {
        fields[exposure.key] = { ...field, label: exposure.label }
      }
    }

    sessionConfig.components[alias] = {
      label: source.name,
      fields,
      defaultProps: { definitionId },
      resolveData: (data, { metadata, trigger }) => {
        if (trigger !== "insert") {
          return data
        }

        const metadataLibrary: unknown = metadata.sharedComponents
        if (!isSharedComponentLibrary(metadataLibrary)) {
          throw new ResponseError("The Shared component library is missing from editor metadata.")
        }

        const currentSource = metadataLibrary[definitionId]
        if (!currentSource) {
          throw new ResponseError(`Shared component "${definitionId}" is no longer available.`)
        }

        const defaults = getSharedInstanceDefaults(currentSource, sessionConfig)
        const props = { ...data.props }
        for (const exposure of currentSource.exposures) {
          if (!Object.hasOwn(props, exposure.key)) {
            props[exposure.key] = defaults[exposure.key]
          }
        }

        return { ...data, props }
      },
      render: ({ id, puck, ...instanceProps }) => {
        if (typeof id !== "string") {
          throw new ResponseError("The Shared component instance is missing its identity.")
        }

        return renderSharedSource(
          definitionId,
          id,
          instanceProps,
          puck.metadata,
          sessionConfig,
          renderTree,
        )
      },
    }
  }

  const exposureKeysByDefinitionId = new Map(
    Object.entries(library).map(([definitionId, source]) => [
      definitionId,
      new Set(source.exposures.map(({ key }) => key)),
    ]),
  )
  const allExposureKeys = new Set(
    Object.values(library).flatMap((source) => source.exposures.map(({ key }) => key)),
  )

  sessionConfig.categories = {
    ...sessionConfig.categories,
    "Shared components": {
      title: "Shared components",
      components: [...aliasesByDefinitionId.values()],
    },
  }

  const mapUntilStable = (
    data: Data,
    mapNode: (node: Data["content"][number]) => Data["content"][number],
  ) => {
    let result = data
    while (true) {
      let changed = false
      result = walkTree(result, sessionConfig, (content) =>
        content.map((node) => {
          const mapped = mapNode(node)
          changed ||= mapped !== node
          return mapped
        }),
      )
      if (!changed) return result
    }
  }

  return {
    config: sessionConfig,
    toEditorData: (data: Data) =>
      mapUntilStable(data, (node) => {
        if (node.type !== SHARED_COMPONENT_TYPE) {
          return node
        }

        const definitionId = node.props.definitionId
        const alias =
          typeof definitionId === "string" ? aliasesByDefinitionId.get(definitionId) : undefined
        return alias ? { ...node, type: alias } : node
      }),
    toStoredData: (data: Data) =>
      stripUnusedSharedExposureProps(
        mapUntilStable(data, (node) => {
          const definitionId = definitionIdsByAlias.get(node.type)
          if (!definitionId) {
            return node
          }

          return {
            ...node,
            type: SHARED_COMPONENT_TYPE,
            props: { ...node.props, definitionId },
          }
        }),
        allExposureKeys,
        exposureKeysByDefinitionId,
      ),
  }
}
