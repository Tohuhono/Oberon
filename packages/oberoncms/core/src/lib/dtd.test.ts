import { createElement } from "react"
import type { ReactNode } from "react"
import { describe, expectTypeOf, it } from "@dev/vitest"
import type { SlotComponent } from "@puckeditor/core"
import { defineOberonComponent } from "./dtd"

describe(
  "defineOberonComponent",
  { tags: ["ai", "feature-component-typing"] },
  () => {
    it("infers text and slot props from fields while preserving Puck props", () => {
      const component = defineOberonComponent({
        fields: {
          className: {
            type: "text",
          },
          content: {
            type: "slot",
          },
        },
        render: ({ className, content: Content, id, puck, editMode }) => {
          expectTypeOf(className).toEqualTypeOf<string | undefined>()
          expectTypeOf(Content).toEqualTypeOf<SlotComponent>()
          expectTypeOf(id).toEqualTypeOf<string>()
          expectTypeOf(puck).toBeObject()
          expectTypeOf(editMode).toEqualTypeOf<boolean | undefined>()

          return createElement(
            "div",
            {
              className,
              "data-component-id": id,
              "data-edit-mode": editMode,
            },
            createElement(Content),
            String(Boolean(puck.isEditing)),
          )
        },
      })

      type RenderProps = Parameters<typeof component.render>[0]

      expectTypeOf<RenderProps["className"]>().toEqualTypeOf<
        string | undefined
      >()
      expectTypeOf<RenderProps["content"]>().toEqualTypeOf<SlotComponent>()
    })

    it("infers rich text values and content-editable textareas as ReactNode", () => {
      defineOberonComponent({
        fields: {
          body: {
            type: "richtext",
          },
          text: {
            type: "textarea",
            contentEditable: true,
          },
        },
        render: ({ body, text }) => {
          expectTypeOf(body).toEqualTypeOf<ReactNode | undefined>()
          expectTypeOf(text).toEqualTypeOf<ReactNode | undefined>()

          return createElement("div", undefined, body, text)
        },
      })
    })

    it("lets render annotations override ambiguous field inference", () => {
      type ImageValue = { url: string } | null

      defineOberonComponent({
        fields: {
          image: {
            type: "custom",
            render: () => createElement("div"),
          },
        },
        render: ({ image }: { image?: ImageValue }) => {
          expectTypeOf(image).toEqualTypeOf<ImageValue | undefined>()

          return image
            ? createElement("img", { alt: "", src: image.url })
            : createElement("div")
        },
      })
    })
  },
)
