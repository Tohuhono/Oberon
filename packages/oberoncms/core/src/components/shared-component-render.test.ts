import { describe, expect, fromPartial, it } from "@dev/vitest"
import type { Config, Data } from "@puckeditor/core"
import { createElement } from "react"

import type { SharedComponentData } from "../lib/dtd"
import { createSharedExposureKey, findSharedReferences } from "../lib/shared-components"
import {
  resolveSharedInstanceData,
  withSharedComponent,
  withSharedEditorComponents,
} from "./shared-component-render"

const config = fromPartial<Config>({
  components: {
    Container: {
      fields: { content: { type: "slot" } },
      render: () => null,
    },
    Text: {
      fields: { text: { type: "text" } },
      render: () => null,
    },
  },
})

describe(
  "Shared component instance rendering",
  { tags: ["ai", "feature-shared-components"] },
  () => {
    it("uses instance values and namespaces source node IDs", () => {
      const key = createSharedExposureKey()
      const source: SharedComponentData = {
        name: "Call to action",
        tree: {
          content: [{ type: "Text", props: { id: "headline", text: "Source headline" } }],
          root: { props: {} },
        },
        exposures: [{ key, nodeId: "headline", prop: "text", label: "Headline" }],
        defaults: {},
      }

      const data = resolveSharedInstanceData(
        source,
        { [key]: "Instance headline" },
        config,
        "instance-1",
      )

      expect(data.content[0]).toMatchObject({
        type: "Text",
        props: { id: "instance-1__headline", text: "Instance headline" },
      })
    })

    it("keeps authored slot children when the instance has no saved value", () => {
      const key = createSharedExposureKey()
      const slotChild = { type: "Text", props: { id: "source-child", text: "Source child" } }
      const source: SharedComponentData = {
        name: "Article",
        tree: {
          content: [
            {
              type: "Container",
              props: { id: "body", content: [slotChild] },
            },
          ],
          root: { props: {} },
        },
        exposures: [{ key, nodeId: "body", prop: "content", label: "Body" }],
        defaults: {},
      }

      const data = resolveSharedInstanceData(source, {}, config, "instance-2")

      expect(data.content[0]).toMatchObject({
        props: {
          id: "instance-2__body",
          content: [{ props: { id: "instance-2__source-child" } }],
        },
      } satisfies Partial<Data["content"][number]>)
    })

    it("maps nested Shared instances to editor aliases and back to stored types", () => {
      const bodyKey = createSharedExposureKey()
      const library: Record<string, SharedComponentData> = {
        article: {
          name: "Article",
          tree: {
            content: [
              {
                type: "Container",
                props: { id: "body", content: [] },
              },
            ],
            root: { props: {} },
          },
          exposures: [{ key: bodyKey, nodeId: "body", prop: "content", label: "Body" }],
          defaults: {},
        },
        navigation: {
          name: "Navigation",
          tree: {
            content: [{ type: "Text", props: { id: "label", text: "Navigation" } }],
            root: { props: {} },
          },
          exposures: [],
          defaults: {},
        },
      }
      const session = withSharedEditorComponents(config, library, () => createElement("div"))
      const pageData: Data = {
        content: [
          {
            type: "SharedComponent",
            props: {
              id: "article-instance",
              definitionId: "article",
              [bodyKey]: [
                {
                  type: "SharedComponent",
                  props: { id: "navigation-instance", definitionId: "navigation" },
                },
              ],
            },
          },
        ],
        root: { props: {} },
      }

      const editorData = session.toEditorData(pageData)
      const storedData = session.toStoredData(editorData)

      expect(editorData.content[0]?.type).toBe("SharedPalette_article")
      expect(storedData).toMatchObject(pageData)
      expect(storedData.content).toEqual(pageData.content)
    })

    it("walks instance-owned slots when finding nested Shared references", () => {
      const bodyKey = createSharedExposureKey()
      const library: Record<string, SharedComponentData> = {
        article: {
          name: "Article",
          tree: {
            content: [
              {
                type: "Container",
                props: { id: "body", content: [] },
              },
            ],
            root: { props: {} },
          },
          exposures: [{ key: bodyKey, nodeId: "body", prop: "content", label: "Body" }],
          defaults: {},
        },
      }
      const sharedConfig = withSharedComponent(config, () => createElement("div"), library)
      const data: Data = {
        content: [
          {
            type: "SharedComponent",
            props: {
              id: "article-instance",
              definitionId: "article",
              [bodyKey]: [
                {
                  type: "SharedComponent",
                  props: { id: "navigation-instance", definitionId: "navigation" },
                },
              ],
            },
          },
        ],
        root: { props: {} },
      }

      expect(findSharedReferences(data, sharedConfig)).toEqual(["navigation", "article"])
    })
  },
)
