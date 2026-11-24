import { FragmentDataSchema, ResponseError, type FragmentData as Data } from "@oberoncms/core"
import type {
  ComponentConfig,
  ComponentData,
  Config,
  Fields,
  PuckContext,
  SlotComponent,
} from "@puckeditor/core"
import { createElement, Fragment, type ReactNode } from "react"

import {
  SHARED_COMPONENT,
  cloneSlot,
  getDefaults,
  getExposureField,
  mapNodes,
  validateContent,
  validateLibrary,
  type SharedDefinition,
} from "./model"

const aliasPrefix = "SharedPalette_"
const slotOnlyProps = new Set([
  "as",
  "allow",
  "disallow",
  "minEmptyHeight",
  "collisionAxis",
  "zone",
  "children",
  "dangerouslySetInnerHTML",
])

export function getAlias(id: string) {
  return `${aliasPrefix}${encodeURIComponent(id)}`
}

function staticSlot(render: () => ReactNode): SlotComponent {
  return (props) =>
    createElement(
      props?.as ?? "div",
      Object.fromEntries(Object.entries(props ?? {}).filter(([key]) => !slotOnlyProps.has(key))),
      render(),
    )
}

function templateIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(templateIds)
  if (typeof value !== "object" || value === null) return value
  const mapped = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, templateIds(child)]),
  )
  if (
    typeof mapped.type === "string" &&
    typeof mapped.props === "object" &&
    mapped.props !== null
  ) {
    return {
      ...mapped,
      props: Object.fromEntries(Object.entries(mapped.props).filter(([key]) => key !== "id")),
    }
  }
  return mapped
}

export function prepareSession(config: Config, definitions: SharedDefinition[], sourceId?: string) {
  validateLibrary(definitions, config)
  const library = new Map(definitions.map((definition) => [definition.id, definition]))
  const aliases = new Map(definitions.map((definition) => [getAlias(definition.id), definition.id]))
  const defaults = new Map(
    definitions.map((definition) => [definition.id, getDefaults(definition, config)]),
  )

  function canonicalNode(node: ComponentData): ComponentData {
    const definitionId =
      aliases.get(node.type) ??
      (node.type === SHARED_COMPONENT ? node.props.definitionId : undefined)
    if (definitionId === undefined) return node
    const definition = library.get(definitionId)
    if (!definition) {
      throw new ResponseError(
        `Shared component "${String(definitionId)}" is missing. Restore its source or remove this instance.`,
      )
    }
    const props: ComponentData["props"] = { id: node.props.id, definitionId }
    for (const [key, exposure] of Object.entries(definition.exposures)) {
      if (Object.hasOwn(node.props, key)) {
        props[key] = node.props[key]
      } else if (exposure.kind === "slot") {
        props[key] = read(
          FragmentDataSchema.parse({
            root: {},
            content: cloneSlot(defaults.get(definitionId)?.[key] ?? []),
          }),
        ).content
      } else {
        props[key] = defaults.get(definitionId)?.[key]
      }
    }
    return { ...node, type: SHARED_COMPONENT, props }
  }

  function read(data: Data): Data {
    return mapNodes(data, canonicalNode)
  }

  function prepare(data: Data): Data {
    const canonical = read(data)
    validateContent(canonical, definitions, config)
    return mapNodes(canonical, (node) =>
      node.type === SHARED_COMPONENT ? { ...node, type: getAlias(node.props.definitionId) } : node,
    )
  }

  function renderDefinition(
    definition: SharedDefinition,
    instance: Record<string, unknown> & { id: string },
    context: PuckContext,
    ancestry: string[] = [],
  ): ReactNode {
    if (ancestry.includes(definition.id)) {
      throw new ResponseError(`Circular Shared component reference in "${definition.name}".`)
    }
    const path = [...ancestry, definition.id]

    function renderNodes(nodes: Data["content"]) {
      return nodes.map((node) => createElement(Fragment, { key: node.props.id }, renderNode(node)))
    }

    function zoneContext(owner: string): PuckContext {
      return {
        ...context,
        dragRef: null,
        renderDropZone: (props) =>
          staticSlot(() => renderNodes(definition.data.zones?.[`${owner}:${props.zone}`] ?? []))(
            props,
          ),
      }
    }

    function renderFields(
      values: Record<string, unknown>,
      fields: Fields | undefined,
    ): Record<string, unknown> {
      const props = { ...values }
      for (const [name, field] of Object.entries(fields ?? {})) {
        const value = props[name]
        if (field.type === "slot" && typeof value !== "function") {
          props[name] = staticSlot(() => renderNodes(Array.isArray(value) ? value : []))
        } else if (
          field.type === "object" &&
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          props[name] = renderFields(Object.fromEntries(Object.entries(value)), field.objectFields)
        } else if (field.type === "array" && Array.isArray(value)) {
          props[name] = value.map((item) => renderFields(item, field.arrayFields))
        }
      }
      return props
    }

    function renderNode(node: ComponentData): ReactNode {
      const canonical = canonicalNode(node)
      const id = `${instance.id}/${node.props.id}`
      if (canonical.type === SHARED_COMPONENT) {
        const nested = library.get(canonical.props.definitionId)
        if (!nested)
          throw new ResponseError(`Shared component "${canonical.props.definitionId}" is missing.`)
        const fields = Object.fromEntries(
          Object.entries(nested.exposures).map(([key, exposure]) => [
            key,
            getExposureField(nested, exposure, config).field,
          ]),
        )
        return renderDefinition(
          nested,
          { ...renderFields(canonical.props, fields), id },
          context,
          path,
        )
      }
      const component = config.components[node.type]
      if (!component) throw new ResponseError(`Component "${node.type}" is not registered.`)
      const values = { ...component.defaultProps, ...node.props }
      for (const [key, exposure] of Object.entries(definition.exposures)) {
        if (exposure.node === node.props.id && Object.hasOwn(instance, key)) {
          values[exposure.prop] = instance[key]
        }
      }
      return createElement(component.render, {
        ...renderFields(values, component.fields),
        id,
        puck: zoneContext(node.props.id),
        editMode: context.isEditing,
      })
    }

    const children = renderNodes(definition.data.content)
    const Root = config.root?.render
    return Root ? (
      <Root
        {...renderFields(
          { ...config.root?.defaultProps, ...definition.data.root.props },
          config.root?.fields,
        )}
        id={`${instance.id}/root`}
        puck={zoneContext("root")}
        editMode={context.isEditing}
      >
        {children}
      </Root>
    ) : (
      children
    )
  }

  const components: Config["components"] = { ...config.components }
  const hidden = [SHARED_COMPONENT]
  for (const definition of definitions) {
    const alias = getAlias(definition.id)
    const fields = Object.fromEntries(
      Object.entries(definition.exposures).map(([key, exposure]) => [
        key,
        { ...getExposureField(definition, exposure, config).field, label: exposure.label },
      ]),
    )
    const defaultData = prepare({
      root: {},
      content: [{ type: SHARED_COMPONENT, props: { id: "template", definitionId: definition.id } }],
    }).content[0]
    if (!defaultData)
      throw new ResponseError(`Could not prepare "${definition.name}" for insertion.`)
    components[alias] = {
      label: definition.name,
      fields,
      defaultProps: Object.fromEntries(
        Object.entries(defaultData.props)
          .filter(([key]) => key !== "id")
          .map(([key, value]) => [key, templateIds(value)]),
      ),
      render: ({ puck, ...props }) =>
        createElement(Fragment, null, renderDefinition(definition, props, puck)),
    } satisfies ComponentConfig
    if (definition.id === sourceId) hidden.push(alias)
  }

  const preparedConfig: Config = {
    ...config,
    components,
    categories: {
      ...config.categories,
      shared: {
        title: "Shared components",
        defaultExpanded: true,
        components: definitions
          .filter((definition) => definition.id !== sourceId)
          .map((definition) => getAlias(definition.id)),
      },
      sharedInternal: { visible: false, components: hidden },
    },
  }
  return { config: preparedConfig, prepare, read }
}
