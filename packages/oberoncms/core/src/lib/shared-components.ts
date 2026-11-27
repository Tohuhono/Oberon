import { migrate, walkTree, type Config, type Data } from "@puckeditor/core"

import type { OberonAdapter, OberonSharedComponentRecord, SharedComponentData } from "./dtd"
import { ResponseError } from "./dtd"

export const SHARED_COMPONENT_TYPE = "SharedComponent"

export function createSharedExposureKey() {
  return `instance_${crypto.randomUUID().replaceAll("-", "_")}`
}

export async function getSharedComponentRecords(
  adapter: Pick<OberonAdapter, "listComponents" | "getComponent">,
): Promise<OberonSharedComponentRecord[]> {
  const components = await adapter.listComponents("shared")
  const records = await Promise.all(components.map(({ key }) => adapter.getComponent({ key })))
  return records.filter((component) => component?.type === "shared")
}

export async function getSharedComponentLibrary(
  adapter: Pick<OberonAdapter, "listComponents" | "getComponent">,
) {
  const components = await getSharedComponentRecords(adapter)
  return Object.fromEntries(components.map(({ key, data }) => [key, data]))
}

export function getNodeById(data: Data, config: Config, id: string) {
  let result: Data["content"][number] | undefined

  walkTree(data, config, (content) => {
    for (const node of content) {
      if (node.props.id === id) {
        result = node
      }
    }
  })

  return result
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

export function isSlotContent(value: unknown): value is Data["content"] {
  return Array.isArray(value) && value.every((item) => isComponentData(item))
}

function copySlotDefaults(value: unknown, config: Config) {
  if (!isSlotContent(value)) {
    return []
  }

  const copy = walkTree({ content: value, root: { props: {} } }, config, (content) =>
    content.map((node) => ({
      ...node,
      props: { ...node.props, id: crypto.randomUUID() },
    })),
  )

  return copy.content
}

export function getSharedInstanceDefaults(source: SharedComponentData, config: Config) {
  const values: Record<string, unknown> = {}
  const tree = migrate(source.tree, config)

  for (const exposure of source.exposures) {
    const node = getNodeById(tree, config, exposure.nodeId)
    const component = node && config.components[node.type]
    const field = component?.fields?.[exposure.prop]
    const isSlot = field?.type === "slot"
    const value = Object.hasOwn(source.defaults, exposure.key)
      ? source.defaults[exposure.key]
      : node && Object.hasOwn(node.props, exposure.prop)
        ? node.props[exposure.prop]
        : component?.defaultProps?.[exposure.prop]

    values[exposure.key] = isSlot
      ? copySlotDefaults(value ?? [], config)
      : value === undefined
        ? ""
        : value
  }

  return values
}

function getExposureKind(
  source: SharedComponentData,
  exposure: SharedComponentData["exposures"][number],
  config: Config,
) {
  const node = getNodeById(source.tree, config, exposure.nodeId)
  const component = node && config.components[node.type]
  const fields = component?.fields
  const field =
    fields && typeof fields === "object" && exposure.prop in fields
      ? fields[exposure.prop]
      : undefined

  return field?.type === "slot" ? "slot" : "scalar"
}

export function findSharedReferences(
  data: Data,
  config: Config,
  defaults: SharedComponentData["defaults"] = {},
) {
  const references = new Set<string>()
  const migratedData = migrate(data, config)

  const collect = (content: Data["content"]) => {
    for (const node of content) {
      if (node.type !== SHARED_COMPONENT_TYPE) {
        continue
      }

      const sharedComponentKey = node.props.sharedComponentKey
      if (typeof sharedComponentKey === "string" && sharedComponentKey) {
        references.add(sharedComponentKey)
      }
    }
  }
  walkTree(migratedData, config, collect)
  for (const value of Object.values(defaults)) {
    if (isSlotContent(value)) {
      walkTree({ root: {}, content: value }, config, collect)
    }
  }

  return [...references]
}

export function validateSharedComponent(
  sourceId: string,
  source: SharedComponentData,
  sources: Record<string, SharedComponentData>,
  config: Config,
) {
  const allSources = { ...sources, [sourceId]: source }
  const migratedTree = migrate(source.tree, config)
  const nodes = new Map<string, (typeof migratedTree.content)[number]>()
  const references = new Map<string, string[]>()
  const errors: string[] = []

  walkTree(migratedTree, config, (content) => {
    for (const node of content) {
      const component = config.components[node.type]
      if (!component) {
        errors.push(`The source uses missing component "${node.type}".`)
        continue
      }

      const nodeId = node.props.id
      if (typeof nodeId === "string" && nodeId) {
        if (nodes.has(nodeId)) {
          errors.push(`The source contains duplicate node ID "${nodeId}".`)
        } else {
          nodes.set(nodeId, node)
        }
      } else {
        errors.push(`The "${node.type}" component is missing its node ID.`)
      }

      if (node.type === SHARED_COMPONENT_TYPE) {
        const targetId = node.props.sharedComponentKey
        if (typeof targetId !== "string" || !targetId) {
          errors.push("A Shared component instance is missing its source.")
        }
      }
    }
  })

  const keys = new Set<string>()
  const targets = new Set<string>()
  const labels = new Set<string>()
  for (const exposure of source.exposures) {
    const node = nodes.get(exposure.nodeId)
    const targetKey = `${exposure.nodeId}\u0000${exposure.prop}`
    const label = exposure.label.trim().toLocaleLowerCase()

    if (keys.has(exposure.key)) {
      errors.push(`The Exposed prop key "${exposure.key}" is duplicated.`)
    }
    keys.add(exposure.key)

    if (targets.has(targetKey)) {
      errors.push(`The prop "${exposure.prop}" is exposed more than once.`)
    }
    targets.add(targetKey)

    if (labels.has(label)) {
      errors.push(`The label "${exposure.label}" is duplicated.`)
    }
    labels.add(label)

    if (!node) {
      errors.push(`The Exposed prop "${exposure.label}" targets a missing node.`)
      continue
    }

    const component = config.components[node.type]
    const fields = component?.fields
    const field =
      fields && typeof fields === "object" && exposure.prop in fields
        ? fields[exposure.prop]
        : undefined

    if (
      !field ||
      node.type === SHARED_COMPONENT_TYPE ||
      exposure.prop === "id" ||
      exposure.prop === "puck"
    ) {
      errors.push(`The Exposed prop "${exposure.label}" targets an invalid or reserved prop.`)
      continue
    }

    const kind = field.type === "slot" ? "slot" : "scalar"
    const existingKind = Object.entries(allSources)
      .filter(([id]) => id !== sourceId)
      .flatMap(([, item]) =>
        item.exposures
          .filter(({ key }) => key === exposure.key)
          .map((itemExposure) => getExposureKind(item, itemExposure, config)),
      )[0]

    if (existingKind && existingKind !== kind) {
      errors.push(`The Exposed prop key "${exposure.key}" changes between a slot and a scalar.`)
    }

    if (kind === "slot") {
      if (Object.hasOwn(source.defaults, exposure.key)) {
        const defaultValue = source.defaults[exposure.key]
        if (isSlotContent(defaultValue)) {
          walkTree({ content: defaultValue, root: {} }, config, (content) => {
            for (const item of content) {
              if (!Object.hasOwn(config.components, item.type)) {
                errors.push(
                  `The default for slot "${exposure.label}" uses missing component "${item.type}".`,
                )
              }
            }
          })
        } else {
          errors.push(`The default for slot "${exposure.label}" must be a Puck component list.`)
        }
      }

      const ownedNodeIds = new Set<string>()
      const children = node.props[exposure.prop]

      if (Array.isArray(children)) {
        walkTree({ content: children, root: { props: {} } }, config, (descendants) => {
          for (const descendant of descendants) {
            if (typeof descendant.props.id === "string") {
              ownedNodeIds.add(descendant.props.id)
            }
          }
        })
      }

      if (source.exposures.some((candidate) => ownedNodeIds.has(candidate.nodeId))) {
        errors.push(
          `The Exposed slot "${exposure.label}" contains another Exposed prop. Use a nested Shared component instead.`,
        )
      }
    }
  }

  for (const key of Object.keys(source.defaults)) {
    if (!keys.has(key)) {
      errors.push(`The default for removed Exposed prop "${key}" is not valid.`)
    }
  }

  for (const target of findSharedReferences(source.tree, config, source.defaults)) {
    if (!Object.hasOwn(allSources, target)) {
      errors.push(`The source references missing Shared component "${target}".`)
    }
  }

  const visited = new Set<string>()
  const ancestors = new Set<string>()
  const visit = (id: string): boolean => {
    if (ancestors.has(id)) {
      return true
    }
    if (visited.has(id)) {
      return false
    }

    visited.add(id)
    ancestors.add(id)
    for (const target of references.get(id) ?? []) {
      if (visit(target)) {
        return true
      }
    }
    ancestors.delete(id)
    return false
  }

  for (const id of Object.keys(allSources)) {
    const componentData = allSources[id]
    if (!componentData) {
      throw new ResponseError(`The Shared component "${id}" does not exist.`)
    }

    references.set(
      id,
      findSharedReferences(componentData.tree, config, componentData.defaults).filter((target) =>
        Object.hasOwn(allSources, target),
      ),
    )
  }

  for (const id of references.keys()) {
    if (visit(id)) {
      errors.push(`The Shared component references contain a cycle through "${id}".`)
      break
    }
  }

  if (errors.length) {
    throw new ResponseError(errors.join(" "))
  }
}

export function sourceEditorUrl(key: string, returnTo: string | null) {
  const search = new URLSearchParams({ source: key })
  if (returnTo) search.set("returnTo", returnTo)
  return `/cms/library?${search}`
}
