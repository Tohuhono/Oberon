import { describe, expect, fromPartial, it } from "@dev/vitest"
import type { Config, Data } from "@puckeditor/core"
import { createElement } from "react"

import type { SharedComponentData } from "../lib/dtd"
import { createSharedExposureKey, findSharedReferences } from "../lib/shared-components"
import { withSharedComponent, withSharedEditorComponents } from "./shared-component-render"

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
