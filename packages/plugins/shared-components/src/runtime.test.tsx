import { describe, expect, it } from "@dev/vitest"
import {
  FragmentDataSchema,
  type FragmentData as Data,
  type OberonClientConfig,
} from "@oberoncms/core"
import { Render, type ComponentData } from "@puckeditor/core"
import { renderToStaticMarkup } from "react-dom/server"

import {
  SHARED_COMPONENT,
  SHARED_METADATA,
  ExposureSchema,
  createDefinition,
  getNodes,
  getReferences,
  readDefinition,
  validateLibrary,
  type Exposure,
  type SharedDefinition,
} from "./model"
import { getAlias, prepareSession } from "./runtime"

const config: OberonClientConfig = {
  version: 1,
  components: {
    Text: {
      fields: { text: { type: "text" }, className: { type: "text" } },
      defaultProps: { text: "Registered default" },
      render: ({ text, className }) => <p className={className}>{text}</p>,
    },
    Container: {
      fields: {
        content: { type: "slot", allow: ["Text", "Container"] },
        className: { type: "text" },
      },
      defaultProps: { content: [] },
      render: ({ content: Content, className }) => <Content className={className} />,
    },
    Number: {
      fields: { value: { type: "number", min: 0, max: 10 } },
      render: ({ value }) => <span>{value}</span>,
    },
    Choice: {
      fields: {
        choice: {
          type: "select",
          options: [
            { label: "None", value: 0 },
            { label: "One", value: 1 },
          ],
        },
      },
      render: ({ choice }) => <span>{choice}</span>,
    },
    Legacy: {
      render: ({ puck }) => <section>{puck.renderDropZone({ zone: "body" })}</section>,
    },
  },
}

function definition(
  name: string,
  data: Data,
  exposures: Record<string, Exposure> = {},
  id?: string,
) {
  const created = createDefinition(name)
  return readDefinition({
    key: id ?? created.id,
    data: {
      ...data,
      root: { ...data.root, props: { ...data.root.props, [SHARED_METADATA]: { name, exposures } } },
    },
  })
}

function article() {
  return definition(
    "Article",
    {
      root: {},
      content: [
        {
          type: "Text",
          props: { id: "announcement", text: "Shared announcement", className: "shared-style" },
        },
        { type: "Text", props: { id: "headline", text: "Default headline" } },
        {
          type: "Container",
          props: {
            id: "body",
            content: [{ type: "Text", props: { id: "default-child", text: "Default body" } }],
          },
        },
      ],
    },
    {
      headline: { node: "headline", prop: "text", kind: "prop", label: "Headline" },
      body: { node: "body", prop: "content", kind: "slot", label: "Body" },
    },
  )
}

function reference(
  source: SharedDefinition,
  id: string,
  props: Record<string, unknown> = {},
): ComponentData {
  return { type: SHARED_COMPONENT, props: { id, definitionId: source.id, ...props } }
}

function content(data: Data, index = 0) {
  const node = data.content[index]
  if (!node) throw new Error(`Missing component at content index ${index}`)
  return node
}

function exposure(source: SharedDefinition, key: string) {
  return ExposureSchema.parse(source.exposures[key])
}

function render(data: Data, definitions: SharedDefinition[], renderConfig = config) {
  const session = prepareSession(renderConfig, definitions)
  return renderToStaticMarkup(<Render config={session.config} data={session.prepare(data)} />)
}

describe("Shared component sessions", { tags: ["ai", "feature-shared-components"] }, () => {
  it("omits optional undefined Puck properties and rejects non-JSON prop values", () => {
    const session = prepareSession(config, [])
    expect(
      session.read({
        root: { props: { title: undefined }, readOnly: undefined },
        content: [{ type: "Text", props: { id: "text", text: "JSON", className: undefined } }],
        zones: undefined,
      }),
    ).toEqual({
      root: { props: {} },
      content: [{ type: "Text", props: { id: "text", text: "JSON" } }],
    })
    expect(() =>
      session.read({
        root: {},
        content: [{ type: "Text", props: { id: "text", text: () => "Not JSON" } }],
      }),
    ).toThrow("Fragment data must be JSON")
  })

  it("keeps independent defaults and IDs, canonical JSON, and immutable source data", () => {
    const source = article()
    const original = JSON.stringify(source)
    const session = prepareSession(config, [source])
    const input = { root: {}, content: [reference(source, "first"), reference(source, "second")] }
    const prepared = session.prepare(input)
    const stored = session.read(prepared)
    const first = content(stored)
    const second = content(stored, 1)

    expect(prepared.content.map((node) => node.type)).toEqual([
      getAlias(source.id),
      getAlias(source.id),
    ])
    expect(stored.content.every((node) => node.type === SHARED_COMPONENT)).toBe(true)
    expect(first.props.headline).toBe("Default headline")
    expect(first.props.body[0].props.id).not.toBe(second.props.body[0].props.id)
    first.props.body[0].props.text = "Local first body"
    expect(second.props.body[0].props.text).toBe("Default body")
    expect(session.read(session.prepare(stored))).toEqual(stored)
    expect(JSON.parse(JSON.stringify(stored))).toEqual(stored)
    expect(JSON.stringify(source)).toBe(original)
  })

  it("updates shared design without resetting instance props or children", () => {
    const source = article()
    const first = reference(source, "first", {
      headline: "First headline",
      body: [{ type: "Text", props: { id: "first-body", text: "First body" } }],
    })
    const second = reference(source, "second", {
      headline: "Second headline",
      body: [{ type: "Text", props: { id: "second-body", text: "Second body" } }],
    })
    const data = { root: {}, content: [first, second] }
    const updated = structuredClone(source)
    content(updated.data).props.text = "Updated announcement"
    content(updated.data).props.className = "new-shared-style"
    content(updated.data, 1).props.text = "Changed default"
    content(updated.data, 2).props.content = []
    const html = render(data, [updated])

    expect(html.match(/Updated announcement/g)).toHaveLength(2)
    expect(html.match(/new-shared-style/g)).toHaveLength(2)
    for (const text of ["First headline", "Second headline", "First body", "Second body"])
      expect(html).toContain(text)
    expect(html).not.toContain("Changed default")
    expect(prepareSession(config, [updated]).read(data)).toEqual(data)
  })

  it("keeps a nested Shared reference shared inside an instance-owned Container", () => {
    const source = article()
    const badge = definition("Badge", {
      root: {},
      content: [
        { type: "Text", props: { id: "badge", text: "Shared badge", className: "badge-design" } },
      ],
    })
    const data = {
      root: {},
      content: [
        reference(source, "article", {
          headline: "Owned headline",
          body: [
            {
              type: "Container",
              props: {
                id: "owned-container",
                className: "local-container",
                content: [
                  { type: "Text", props: { id: "owned-text", text: "Owned text" } },
                  reference(badge, "nested-badge"),
                ],
              },
            },
          ],
        }),
      ],
    }
    const updated = structuredClone(badge)
    content(updated.data).props.text = "New shared badge"
    const html = render(data, [source, updated])
    for (const text of [
      "New shared badge",
      "Owned headline",
      "Owned text",
      "local-container",
      "badge-design",
    ])
      expect(html).toContain(text)
    expect(html).not.toContain("Shared badge")
    expect(getReferences(data)).toEqual(new Set([badge.id, source.id]))
  })

  it("preserves source composition and instance values across nested references", () => {
    const navigation = definition("Navigation", {
      root: {},
      content: [{ type: "Text", props: { id: "navigation", text: "Main navigation" } }],
    })
    const header = definition("Header", {
      root: {},
      content: [reference(navigation, "navigation-reference")],
    })
    const layout = definition("Layout", {
      root: {},
      content: [reference(header, "header-reference")],
    })
    expect(
      render({ root: {}, content: [reference(layout, "layout")] }, [layout, header, navigation]),
    ).toContain("Main navigation")
  })

  it("retains storage identity on label changes and never reconnects removed props", () => {
    const source = article()
    const session = prepareSession(config, [source])
    const stored = session.read({
      root: {},
      content: [reference(source, "article", { headline: "Keep me" })],
    })
    const renamed = structuredClone(source)
    renamed.name = "Renamed Article"
    renamed.exposures.headline = { ...exposure(renamed, "headline"), label: "Article heading" }
    const renamedSession = prepareSession(config, [renamed])
    expect(renamedSession.config.components[getAlias(source.id)]?.fields?.headline?.label).toBe(
      "Article heading",
    )
    expect(content(renamedSession.read(stored)).props.headline).toBe("Keep me")
    delete renamed.exposures.headline
    renamed.exposures.newHeadline = {
      node: "headline",
      prop: "text",
      kind: "prop",
      label: "Heading",
    }
    const reset = content(prepareSession(config, [renamed]).read(stored))
    expect(reset.props.newHeadline).toBe("Default headline")
    expect(Object.hasOwn(reset.props, "headline")).toBe(false)
  })

  it("initialises a newly exposed slot once and preserves its values after default changes", () => {
    const source = article()
    delete source.exposures.body
    const data = prepareSession(config, [source]).read({
      root: {},
      content: [reference(source, "instance")],
    })
    const exposed = article()
    exposed.id = source.id
    const initialised = prepareSession(config, [exposed]).read(data)
    const updated = structuredClone(exposed)
    content(updated.data, 2).props.content[0].props.text = "Later default"
    expect(prepareSession(config, [updated]).read(initialised)).toEqual(initialised)
    expect(render(initialised, [updated])).toContain("Default body")
    expect(render(initialised, [updated])).not.toContain("Later default")
  })

  it("reuses number, choice, and slot field settings while preserving falsey defaults", () => {
    const source = definition(
      "Fields",
      {
        root: {},
        content: [
          { type: "Number", props: { id: "number", value: 0 } },
          { type: "Choice", props: { id: "choice", choice: 0 } },
          { type: "Container", props: { id: "container", content: [] } },
        ],
      },
      {
        amount: { node: "number", prop: "value", kind: "prop", label: "Amount" },
        choice: { node: "choice", prop: "choice", kind: "prop", label: "Choice" },
        content: { node: "container", prop: "content", kind: "slot", label: "Content" },
      },
    )
    const session = prepareSession(config, [source])
    const generated = session.config.components[getAlias(source.id)]
    expect(generated?.fields?.amount).toEqual({ type: "number", min: 0, max: 10, label: "Amount" })
    expect(generated?.fields?.content).toEqual({
      type: "slot",
      allow: ["Text", "Container"],
      label: "Content",
    })
    expect(
      content(session.read({ root: {}, content: [reference(source, "fields")] })).props,
    ).toMatchObject({ amount: 0, choice: 0, content: [] })
  })

  it("maps and validates root slots and legacy zones through the same traversal", () => {
    const source = definition("Badge", {
      root: {},
      content: [{ type: "Text", props: { id: "badge", text: "Root and zone badge" } }],
    })
    const withRoot: OberonClientConfig = {
      ...config,
      root: {
        fields: { aside: { type: "slot" } },
        render: ({ children, aside: Aside }) => (
          <main>
            {children}
            <aside>
              <Aside />
            </aside>
          </main>
        ),
      },
    }
    const data: Data = {
      root: { props: { aside: [reference(source, "root-reference")] } },
      content: [{ type: "Legacy", props: { id: "legacy" } }],
      zones: { "legacy:body": [reference(source, "zone-reference")] },
    }
    const session = prepareSession(withRoot, [source])
    expect(getReferences(data)).toEqual(new Set([source.id]))
    expect(session.read(session.prepare(data))).toEqual(data)
    expect(render(data, [source], withRoot).match(/Root and zone badge/g)).toHaveLength(2)
  })

  it("renders a source root layout and legacy source zones without nested Puck contexts", () => {
    const source = definition("Legacy design", {
      root: {},
      content: [{ type: "Legacy", props: { id: "legacy" } }],
      zones: {
        "legacy:body": [
          { type: "Text", props: { id: "legacy-text", text: "Shared zone content" } },
        ],
      },
    })
    const withRoot: OberonClientConfig = {
      ...config,
      root: { render: ({ children }) => <section className="root-design">{children}</section> },
    }
    const html = render(
      { root: {}, content: [reference(source, "legacy-source")] },
      [source],
      withRoot,
    )
    expect(html).toContain("Shared zone content")
    expect(html.match(/root-design/g)).toHaveLength(2)
  })

  it("rejects missing references, duplicate IDs, cycles, and overlapping slot ownership", () => {
    const source = article()
    expect(() =>
      prepareSession(config, []).prepare({ root: {}, content: [reference(source, "missing")] }),
    ).toThrow("missing")
    const duplicate = structuredClone(source)
    duplicate.data.content.push({ ...content(duplicate.data) })
    expect(() => validateLibrary([duplicate], config)).toThrow("Duplicate component ID")
    const overlap = structuredClone(source)
    overlap.exposures.nested = {
      node: "default-child",
      prop: "text",
      kind: "prop",
      label: "Nested",
    }
    expect(() => validateLibrary([overlap], config)).toThrow("inside an instance-owned slot")
    const cyclic = structuredClone(source)
    cyclic.data = FragmentDataSchema.parse({
      ...cyclic.data,
      root: { props: { ...cyclic.data.root.props, aside: [reference(source, "root-cycle")] } },
    })
    expect(() => validateLibrary([cyclic], config)).toThrow("cycle")
  })

  it("rejects dangling and duplicate exposure targets and conflicting labels", () => {
    const source = article()
    source.exposures.dangling = { node: "removed", prop: "text", kind: "prop", label: "Missing" }
    expect(() => validateLibrary([source], config)).toThrow("supported target")
    delete source.exposures.dangling
    source.exposures.duplicate = { ...exposure(source, "headline"), label: "Other label" }
    expect(() => validateLibrary([source], config)).toThrow("same target twice")
    delete source.exposures.duplicate
    source.exposures.body = { ...exposure(source, "body"), label: "headline" }
    expect(() => validateLibrary([source], config)).toThrow("labels must be unique")
  })

  it("rejects scalar-slot mismatches and invalid stored instance values", () => {
    const source = article()
    expect(() =>
      prepareSession(config, [source]).prepare({
        root: {},
        content: [reference(source, "bad", { body: "not a slot" })],
      }),
    ).toThrow("must contain component children")
    expect(() =>
      prepareSession(config, [source]).prepare({
        root: {},
        content: [reference(source, "bad", { headline: 123 })],
      }),
    ).toThrow("invalid value")
    source.exposures.body = { ...exposure(source, "body"), kind: "prop" }
    expect(() => validateLibrary([source], config)).toThrow("invalid slot ownership")
  })

  it("keeps native insertion templates ID-free while prepared defaults get unique IDs", () => {
    const source = article()
    const session = prepareSession(config, [source])
    const defaults = session.config.components[getAlias(source.id)]?.defaultProps
    if (!defaults) throw new Error("Missing insertion defaults")
    expect(defaults.body[0].props.id).toBeUndefined()
    const stored = session.read({
      root: {},
      content: [reference(source, "one"), reference(source, "two")],
    })
    expect(getNodes(stored).size).toBe(4)
  })
})
