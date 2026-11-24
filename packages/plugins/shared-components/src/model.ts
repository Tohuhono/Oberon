import {
  FragmentDataSchema,
  JsonValueSchema,
  ResponseError,
  type FragmentData as Data,
  type JsonValue,
} from "@oberoncms/core"
import type { ComponentData, Config, Field } from "@puckeditor/core"
import { z } from "zod"

export const SHARED_COMPONENT = "SharedComponent"
export const SHARED_METADATA = "__sharedComponent"
const reservedProps = new Set([
  "id",
  "definitionId",
  "puck",
  "editMode",
  "children",
  "__proto__",
  "prototype",
  "constructor",
])

const ExposureKeySchema = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)
  .refine((key) => !reservedProps.has(key), "This prop key is reserved")

export const ExposureSchema = z.object({
  node: z.string().min(1),
  prop: z
    .string()
    .min(1)
    .refine((prop) => !reservedProps.has(prop), "This prop is reserved"),
  kind: z.enum(["prop", "slot"]),
  label: z.string().trim().min(1).max(100),
})

export const SharedMetadataSchema = z.object({
  name: z.string().trim().min(1, "Give the Shared component a name").max(100),
  exposures: z.record(ExposureKeySchema, ExposureSchema).default({}),
})

export const SharedDefinitionSchema = z.object({
  id: z.string().min(1),
  name: SharedMetadataSchema.shape.name,
  exposures: SharedMetadataSchema.shape.exposures,
  data: FragmentDataSchema,
  updatedAt: z.iso.datetime().nullable().default(null),
  updatedBy: z.string().default(""),
})

export const SharedLibrarySchema = z.object({
  definitions: z.array(SharedDefinitionSchema),
  canWrite: z.boolean(),
})

export type SharedDefinition = z.infer<typeof SharedDefinitionSchema>
export type Exposure = z.infer<typeof ExposureSchema>
export type ExposableField = Extract<
  Field,
  { type: "text" | "textarea" | "number" | "select" | "radio" | "slot" }
>

export function readDefinition({
  key,
  data,
  updatedAt,
  updatedBy = "",
}: {
  key: string
  data: Data
  updatedAt?: Date
  updatedBy?: string
}): SharedDefinition {
  const metadata = SharedMetadataSchema.parse(data.root.props?.[SHARED_METADATA])
  return SharedDefinitionSchema.parse({
    id: key,
    ...metadata,
    data,
    updatedAt: updatedAt?.toISOString() ?? null,
    updatedBy,
  })
}

export function createDefinition(name: string): SharedDefinition {
  return readDefinition({
    key: `shared:${crypto.randomUUID()}`,
    data: {
      root: { props: { [SHARED_METADATA]: { name, exposures: {} } } },
      content: [],
    },
  })
}

export function isComponentNode(value: unknown): value is ComponentData {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string" &&
    "props" in value &&
    typeof value.props === "object" &&
    value.props !== null &&
    "id" in value.props &&
    typeof value.props.id === "string"
  )
}

export function mapNodes(data: Data, transform: (node: ComponentData) => ComponentData): Data {
  function mapValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(mapValue)
    if (typeof value !== "object" || value === null) return value
    const mapped = Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .map(([key, child]) => [key, mapValue(child)]),
    )
    if (isComponentNode(mapped)) return transform(mapped)
    return mapped
  }
  return FragmentDataSchema.parse(mapValue(data))
}

export function visitNodes(data: Data, visit: (node: ComponentData) => void) {
  mapNodes(data, (node) => {
    visit(node)
    return node
  })
}

export function getNodes(data: Data) {
  const nodes = new Map<string, ComponentData>()
  visitNodes(data, (node) => {
    if (nodes.has(node.props.id)) {
      throw new ResponseError(
        `Duplicate component ID "${node.props.id}". Remove the duplicate and insert it again.`,
      )
    }
    nodes.set(node.props.id, node)
  })
  return nodes
}

export function getReferences(data: Data) {
  const references = new Set<string>()
  visitNodes(data, (node) => {
    if (node.type !== SHARED_COMPONENT) return
    if (typeof node.props.definitionId !== "string" || !node.props.definitionId) {
      throw new ResponseError(
        "A Shared component has no source. Remove it and insert a source from the library.",
      )
    }
    references.add(node.props.definitionId)
  })
  return references
}

export function isExposableField(field: { type: string }): field is ExposableField {
  return ["text", "textarea", "number", "select", "radio", "slot"].includes(field.type)
}

export function getExposureField(
  definition: SharedDefinition,
  exposure: Exposure,
  config: Config,
): { node: ComponentData; field: ExposableField } {
  const node = getNodes(definition.data).get(exposure.node)
  const field = node && config.components[node.type]?.fields?.[exposure.prop]
  if (!node || node.type === SHARED_COMPONENT || !field || !isExposableField(field)) {
    throw new ResponseError(
      `"${exposure.label}" no longer has a supported target in "${definition.name}". Remove the Exposed prop or restore its source component.`,
    )
  }
  if ((field.type === "slot") !== (exposure.kind === "slot")) {
    throw new ResponseError(
      `"${exposure.label}" has an invalid slot ownership mapping in "${definition.name}".`,
    )
  }
  return { node, field }
}

export function getDefaults(definition: SharedDefinition, config: Config) {
  const defaults: Record<string, JsonValue> = {}
  for (const [key, exposure] of Object.entries(definition.exposures)) {
    const { node, field } = getExposureField(definition, exposure, config)
    const registered = config.components[node.type]?.defaultProps
    const value = Object.hasOwn(node.props, exposure.prop)
      ? node.props[exposure.prop]
      : registered?.[exposure.prop]
    if (field.type === "slot" && value !== undefined && !Array.isArray(value)) {
      throw new ResponseError(
        `"${exposure.label}" in "${definition.name}" must have slot defaults.`,
      )
    }
    defaults[key] = JsonValueSchema.parse(
      value ??
        (field.type === "slot"
          ? []
          : field.type === "number"
            ? 0
            : field.type === "select" || field.type === "radio"
              ? (field.options[0]?.value ?? "")
              : ""),
    )
  }
  return defaults
}

export function cloneSlot(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(cloneSlot)
  if (typeof value !== "object" || value === null) return value
  const cloned = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, cloneSlot(child)]),
  )
  if (
    typeof cloned.type === "string" &&
    typeof cloned.props === "object" &&
    cloned.props !== null &&
    !Array.isArray(cloned.props)
  ) {
    return { ...cloned, props: { ...cloned.props, id: `shared-${crypto.randomUUID()}` } }
  }
  return cloned
}

export function validateContent(data: Data, definitions: SharedDefinition[], config: Config) {
  const library = new Map(definitions.map((definition) => [definition.id, definition]))
  getNodes(data)
  visitNodes(data, (node) => {
    if (node.type !== SHARED_COMPONENT) {
      if (!config.components[node.type]) {
        throw new ResponseError(
          `Component "${node.type}" is not registered. Restore it in the Oberon config or remove it from the content.`,
        )
      }
      return
    }
    const definition = library.get(node.props.definitionId)
    if (!definition) {
      throw new ResponseError(
        `Shared component "${String(node.props.definitionId)}" is missing. Restore its source or remove this instance.`,
      )
    }
    for (const [key, exposure] of Object.entries(definition.exposures)) {
      if (!Object.hasOwn(node.props, key)) continue
      const { field } = getExposureField(definition, exposure, config)
      const value = node.props[key]
      if (field.type === "slot") {
        if (!Array.isArray(value) || !value.every(isComponentNode)) {
          throw new ResponseError(
            `"${exposure.label}" in "${definition.name}" must contain component children.`,
          )
        }
      } else if (
        ((field.type === "text" || field.type === "textarea") && typeof value !== "string") ||
        (field.type === "number" && (typeof value !== "number" || !Number.isFinite(value))) ||
        ((field.type === "select" || field.type === "radio") &&
          !field.options.some((option) => option.value === value))
      ) {
        throw new ResponseError(
          `"${exposure.label}" in "${definition.name}" has an invalid value for its ${field.type} field.`,
        )
      }
    }
  })
}

export function validateLibrary(definitions: SharedDefinition[], config: Config) {
  const library = new Map<string, SharedDefinition>()
  const fieldKinds = new Map<string, string>()
  for (const definition of definitions) {
    if (library.has(definition.id))
      throw new ResponseError(`Duplicate Shared component identity "${definition.id}".`)
    library.set(definition.id, definition)
    const labels = new Set<string>()
    const targets = new Set<string>()
    const ownedChildren = new Set<string>()
    for (const [key, exposure] of Object.entries(definition.exposures)) {
      ExposureKeySchema.parse(key)
      ExposureSchema.parse(exposure)
      const { node } = getExposureField(definition, exposure, config)
      const target = `${exposure.node}:${exposure.prop}`
      const label = exposure.label.toLowerCase()
      if (targets.has(target))
        throw new ResponseError(
          `"${exposure.label}" exposes the same target twice in "${definition.name}".`,
        )
      if (labels.has(label))
        throw new ResponseError(`Exposed prop labels must be unique in "${definition.name}".`)
      if (fieldKinds.has(key) && fieldKinds.get(key) !== exposure.kind) {
        throw new ResponseError(`Exposed prop "${key}" cannot be both a slot and a scalar prop.`)
      }
      targets.add(target)
      labels.add(label)
      fieldKinds.set(key, exposure.kind)
      if (exposure.kind === "slot") {
        const content = node.props[exposure.prop] ?? []
        if (!Array.isArray(content))
          throw new ResponseError(`"${exposure.label}" must have slot defaults.`)
        visitNodes({ root: {}, content }, (child) => ownedChildren.add(child.props.id))
      }
    }
    for (const exposure of Object.values(definition.exposures)) {
      if (ownedChildren.has(exposure.node)) {
        throw new ResponseError(
          `"${exposure.label}" is inside an instance-owned slot in "${definition.name}". Keep it local, or use a nested Shared component for shared design.`,
        )
      }
    }
  }
  for (const definition of definitions) validateContent(definition.data, definitions, config)
  const visited = new Set<string>()
  function checkCycle(id: string, path: string[]) {
    if (path.includes(id)) {
      throw new ResponseError(
        `Shared component cycle: ${[...path, id].map((key) => library.get(key)?.name ?? key).join(" -> ")}. Remove the circular reference.`,
      )
    }
    if (visited.has(id)) return
    const definition = library.get(id)
    if (!definition) throw new ResponseError(`Shared component "${id}" is missing.`)
    for (const reference of getReferences(definition.data)) checkCycle(reference, [...path, id])
    visited.add(id)
  }
  for (const definition of definitions) checkCycle(definition.id, [])
}
