import { describe, expect, fromPartial, it } from "@dev/vitest"
import type { Config, Data, SlotComponent } from "@puckeditor/core"
import { createElement } from "react"
import { renderToReadableStream } from "react-dom/server"

import type { OberonClientConfig, SharedComponentData } from "../lib/dtd"
import { createSharedExposureKey, findSharedReferences } from "../lib/shared-components"
import { Render } from "../render"
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
              sharedComponentKey: "article",
              [bodyKey]: [
                {
                  type: "SharedComponent",
                  props: { id: "navigation-instance", sharedComponentKey: "navigation" },
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

    it("renders distinct instance-owned slot children and resolves components inside the source", async () => {
      const body = createSharedExposureKey()
      const library = {
        article: {
          name: "Article",
          tree: {
            root: {},
            content: [
              {
                type: "Container",
                props: {
                  id: "container",
                  content: [{ type: "Text", props: { id: "default", text: "Source default" } }],
                },
              },
            ],
          },
          exposures: [{ key: body, nodeId: "container", prop: "content", label: "Body" }],
          defaults: {},
        },
        header: {
          name: "Site header",
          tree: {
            root: {},
            content: [
              {
                type: "SharedComponent",
                props: { id: "navigation-in-header", sharedComponentKey: "navigation" },
              },
            ],
          },
          exposures: [],
          defaults: {},
        },
        navigation: {
          name: "Main navigation",
          tree: {
            root: {},
            content: [{ type: "Text", props: { id: "navigation", text: "Main navigation" } }],
          },
          exposures: [],
          defaults: {},
        },
      }
      const publicConfig = fromPartial<OberonClientConfig>({
        components: {
          Container: {
            fields: { content: { type: "slot" } },
            resolveData: () => ({ props: { heading: "Resolved title" } }),
            render: ({ content: Slot, heading }: { content: SlotComponent; heading: string }) =>
              createElement("article", null, heading, createElement(Slot)),
          },
          Text: {
            render: ({ text }: { text: string }) => createElement("p", null, text),
          },
        },
      })
      const data: Data = {
        root: {},
        content: ["First", "Second"].map((text) => ({
          type: "SharedComponent",
          props: {
            id: text,
            sharedComponentKey: "article",
            [body]: [
              { type: "Text", props: { id: `${text}-child`, text } },
              ...(text === "First"
                ? [
                    {
                      type: "SharedComponent",
                      props: { id: "header-in-article", sharedComponentKey: "header" },
                    },
                  ]
                : []),
            ],
          },
        })),
      }

      const result = await Render({ config: publicConfig, data, sharedComponents: library })
      const html = await new Response(await renderToReadableStream(result)).text()

      expect(html).toContain(
        "<article>Resolved title<div><p>First</p><p>Main navigation</p></div></article>",
      )
      expect(html).toContain("<article>Resolved title<div><p>Second</p></div></article>")
      expect(html).not.toContain("Source default")
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
              sharedComponentKey: "article",
              [bodyKey]: [
                {
                  type: "SharedComponent",
                  props: { id: "navigation-instance", sharedComponentKey: "navigation" },
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
