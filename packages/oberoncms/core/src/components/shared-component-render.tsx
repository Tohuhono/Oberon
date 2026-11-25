import {
  migrate,
  walkTree,
  type Config,
  type Data,
  type Metadata,
  type ComponentData,
  type SlotComponent,
} from "@puckeditor/core"
import { createElement, type ReactElement } from "react"

import type { SharedComponentData } from "../lib/dtd"
import {
  getNodeById,
  getSharedInstanceDefaults,
  SHARED_COMPONENT_TYPE,
} from "../lib/shared-components"
import { SharedSlot, SharedSlotOwner } from "./editor/shared-slot"

type SharedComponentLibrary = Record<string, SharedComponentData>
const sharedPalettePrefix = "SharedPalette_"
type SharedTreeRenderer = (props: {
  config: Config
  data: Data
  metadata: Metadata
}) => ReactElement

function isRenderedSlot(value: unknown): value is SlotComponent {
  return typeof value === "function"
}

export function isSharedEditorComponent(type: string) {
  return type === SHARED_COMPONENT_TYPE || type.startsWith(sharedPalettePrefix)
}

function getExposureFields(source: SharedComponentData, config: Config) {
  const fields: NonNullable<Config["components"][string]["fields"]> = {}
  const tree = migrate(source.tree, config)
  for (const exposure of source.exposures) {
    const node = getNodeById(tree, config, exposure.nodeId)
    const field = node && config.components[node.type]?.fields?.[exposure.prop]
    if (field) fields[exposure.key] = { ...field, label: exposure.label }
  }
  return fields
}

function renderSharedSource(
  key: unknown,
  instanceId: string,
  values: Record<string, unknown>,
  metadata: Metadata,
  isEditing: boolean,
  config: Config,
  fallbackLibrary: SharedComponentLibrary,
  renderTree: SharedTreeRenderer,
) {
  const library: SharedComponentLibrary = metadata.sharedComponents ?? fallbackLibrary
  const stack: ReadonlySet<string> =
    metadata.sharedComponentStack instanceof Set ? metadata.sharedComponentStack : new Set<string>()
  const source = typeof key === "string" && Object.hasOwn(library, key) ? library[key] : undefined
  if (typeof key !== "string" || !source || stack.has(key))
    return createElement("span", { hidden: true })

  const slots = new Map<string, Record<string, unknown>>()
  const slotOwners = new Set<string>()
  const tree = migrate(source.tree, config)
  const data = walkTree(tree, config, (content) =>
    content.map((node) => {
      const props = { ...node.props, id: `${instanceId}__${node.props.id}` }
      for (const exposure of source.exposures) {
        if (exposure.nodeId !== node.props.id || !Object.hasOwn(values, exposure.key)) continue
        const value = values[exposure.key]
        const field = config.components[node.type]?.fields?.[exposure.prop]
        if (field?.type === "slot" && isRenderedSlot(value)) {
          slots.set(props.id, {
            ...slots.get(props.id),
            [exposure.prop]: isEditing
              ? (slotProps: Parameters<SlotComponent>[0]) =>
                  createElement(SharedSlot, {
                    slotKey: exposure.key,
                    slot: value,
                    props: slotProps,
                  })
              : value,
          })
          slotOwners.add(node.type)
          Object.assign(props, { [exposure.prop]: [] })
        } else {
          Object.assign(props, { [exposure.prop]: value })
        }
      }
      return { ...node, props }
    }),
  )

  const nestedConfig = {
    ...config,
    root: config.root && { ...config.root, render: undefined },
    components: { ...config.components },
  }
  for (const type of slotOwners) {
    const component = config.components[type]
    if (!component) continue
    nestedConfig.components[type] = {
      ...component,
      render: (props) => createElement(component.render, { ...props, ...slots.get(props.id) }),
    }
  }

  const rendered = renderTree({
    config: nestedConfig,
    data,
    metadata: { ...metadata, sharedComponentStack: new Set([...stack, key]) },
  })
  return isEditing && slots.size ? createElement(SharedSlotOwner, null, rendered) : rendered
}

function fillInstanceValues<Node extends Pick<ComponentData, "props">>(
  data: Node,
  source: SharedComponentData,
  config: Config,
) {
  const missing = source.exposures.filter(({ key }) => !Object.hasOwn(data.props, key))
  if (!missing.length) return data
  const defaults = getSharedInstanceDefaults(source, config)
  const props = { ...data.props }
  for (const { key } of missing) props[key] = defaults[key]
  return { ...data, props }
}

export function withSharedComponent(
  config: Config,
  renderTree: SharedTreeRenderer,
  library: SharedComponentLibrary = {},
): Config {
  const fields: NonNullable<Config["components"][string]["fields"]> = {}
  for (const source of Object.values(library)) {
    for (const [prop, field] of Object.entries(getExposureFields(source, config))) {
      if (field.type === "slot") fields[prop] = field
    }
  }

  const sharedConfig: Config = { ...config, components: { ...config.components } }
  sharedConfig.components[SHARED_COMPONENT_TYPE] = {
    label: "Shared component",
    fields,
    resolveData: (data) => {
      const key: unknown = data.props.sharedComponentKey
      const source =
        typeof key === "string" && Object.hasOwn(library, key) ? library[key] : undefined
      return source ? fillInstanceValues(data, source, sharedConfig) : data
    },
    render: ({ sharedComponentKey, id, puck, ...values }) =>
      renderSharedSource(
        sharedComponentKey,
        id,
        values,
        puck.metadata,
        puck.isEditing,
        sharedConfig,
        library,
        renderTree,
      ),
  }

  return sharedConfig
}

export function withSharedEditorComponents(
  config: Config,
  library: SharedComponentLibrary,
  renderTree: SharedTreeRenderer,
) {
  const sharedConfig = withSharedComponent(config, renderTree, library)
  const canonical = sharedConfig.components[SHARED_COMPONENT_TYPE]
  const sessionConfig: Config = {
    ...sharedConfig,
    components: {
      ...sharedConfig.components,
      ...(canonical && { [SHARED_COMPONENT_TYPE]: { ...canonical, fields: {} } }),
    },
  }
  const aliases = new Map<string, string>()
  const keys = new Map<string, string>()

  for (const [key, source] of Object.entries(library)) {
    const alias = `${sharedPalettePrefix}${encodeURIComponent(key)}`
    aliases.set(key, alias)
    keys.set(alias, key)

    sessionConfig.components[alias] = {
      label: source.name,
      fields: getExposureFields(source, sessionConfig),
      defaultProps: { sharedComponentKey: key },
      resolveData: (data) => {
        const resolved = fillInstanceValues(data, source, sharedConfig)
        return resolved === data
          ? data
          : walkTree({ ...resolved, type: alias }, sessionConfig, aliasSharedNodes)
      },
      render: ({ id, puck, ...values }) =>
        renderSharedSource(
          key,
          id,
          values,
          puck.metadata,
          puck.isEditing,
          sharedConfig,
          library,
          renderTree,
        ),
    }
  }

  sessionConfig.categories = {
    ...sessionConfig.categories,
    "Shared components": { title: "Shared components", components: [...aliases.values()] },
  }

  const aliasSharedNodes = (content: Data["content"]): Data["content"] =>
    content.map((node) => {
      const key: unknown = node.props.sharedComponentKey
      const alias =
        node.type === SHARED_COMPONENT_TYPE && typeof key === "string"
          ? aliases.get(key)
          : undefined
      if (!alias || typeof key !== "string") return node
      const source = library[key]
      if (!source) return node
      const instance = fillInstanceValues({ ...node, type: alias }, source, sharedConfig)
      return walkTree(instance, sessionConfig, aliasSharedNodes)
    })

  return {
    config: sessionConfig,
    toEditorData: (data: Data) =>
      walkTree(migrate(data, sessionConfig), sessionConfig, aliasSharedNodes),
    toStoredData: (data: Data) =>
      walkTree(data, sessionConfig, (content) =>
        content.map((node) => {
          const key = keys.get(node.type)
          return key
            ? {
                ...node,
                type: SHARED_COMPONENT_TYPE,
                props: { ...node.props, sharedComponentKey: key },
              }
            : node
        }),
      ),
  }
}
