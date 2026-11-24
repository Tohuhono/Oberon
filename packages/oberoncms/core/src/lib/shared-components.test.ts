import { describe, expect, fromPartial, it } from "@dev/vitest"
import type { Config, Data } from "@puckeditor/core"

import type { SharedComponentData } from "./dtd"
import {
  createSharedExposureKey,
  getSharedInstanceDefaults,
  validateSharedComponent,
} from "./shared-components"

const config = fromPartial<Config>({
  components: {
    Container: {
      fields: { content: { type: "slot" } },
      render: () => null,
    },
    SharedComponent: {
      fields: { definitionId: { type: "text" } },
      render: () => null,
    },
    Text: {
      fields: { className: { type: "text" }, text: { type: "text" } },
      defaultProps: { className: "default-class", text: "registered text" },
      render: () => null,
    },
  },
})

function source(
  content: Data["content"],
  exposures: SharedComponentData["exposures"] = [],
): SharedComponentData {
  return {
    name: "Source",
    tree: { content, root: { props: {} } },
    exposures,
    defaults: {},
  }
}

describe("Shared component validation", { tags: ["ai", "feature-shared-components"] }, () => {
  it("rejects a reference cycle across sources", () => {
    const first = source([
      { type: "SharedComponent", props: { id: "first-ref", definitionId: "second" } },
    ])
    const second = source([
      { type: "SharedComponent", props: { id: "second-ref", definitionId: "first" } },
    ])

    expect(() => validateSharedComponent("first", first, { second }, config)).toThrow(/cycle/u)
  })

  it("rejects an exposure inside an instance-owned slot", () => {
    const containerId = "container"
    const textId = "text"
    const shared = source(
      [
        {
          type: "Container",
          props: {
            id: containerId,
            content: [{ type: "Text", props: { id: textId, text: "Body" } }],
          },
        },
      ],
      [
        { key: createSharedExposureKey(), nodeId: containerId, prop: "content", label: "Body" },
        { key: createSharedExposureKey(), nodeId: textId, prop: "text", label: "Headline" },
      ],
    )

    expect(() => validateSharedComponent("article", shared, {}, config)).toThrow(
      /contains another Exposed prop/u,
    )
  })

  it("rejects a missing referenced source with its identity", () => {
    const shared = source([
      { type: "SharedComponent", props: { id: "missing-ref", definitionId: "missing" } },
    ])

    expect(() => validateSharedComponent("source", shared, {}, config)).toThrow(
      /missing Shared component "missing"/u,
    )
  })

  it("resolves Exposed prop defaults in precedence order and gives slots new IDs", () => {
    const textId = "text"
    const containerId = "container"
    const authoredSlot = [{ type: "Text", props: { id: "child", text: "Body" } }]
    const explicitKey = createSharedExposureKey()
    const authoredKey = createSharedExposureKey()
    const registeredKey = createSharedExposureKey()
    const slotKey = createSharedExposureKey()
    const shared = source(
      [
        {
          type: "Container",
          props: { id: containerId, content: authoredSlot },
        },
        {
          type: "Text",
          props: { id: textId, className: "", text: "authored text" },
        },
        {
          type: "Text",
          props: { id: "registered" },
        },
      ],
      [
        { key: explicitKey, nodeId: textId, prop: "className", label: "Explicit" },
        { key: authoredKey, nodeId: textId, prop: "text", label: "Authored" },
        { key: registeredKey, nodeId: "registered", prop: "text", label: "Registered" },
        { key: slotKey, nodeId: containerId, prop: "content", label: "Body" },
      ],
    )
    shared.defaults[explicitKey] = false

    const values = getSharedInstanceDefaults(shared, config)

    expect(values[explicitKey]).toBe(false)
    expect(values[authoredKey]).toBe("authored text")
    expect(values[registeredKey]).toBe("registered text")
    expect(values[slotKey]).toMatchObject([{ type: "Text", props: { text: "Body" } }])
    expect((values[slotKey] as Data["content"])[0]?.props.id).not.toBe("child")
  })
})
