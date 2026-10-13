import { describe, expect, expectTypeOf, it } from "@dev/vitest"
import type { SlotComponent } from "@puckeditor/core"
import { createElement } from "react"
import type { ReactNode } from "react"

import { AddUserSchema, defineOberonComponent, PageSchema, SignInSchema, UserSchema } from "./dtd"

describe("CMS input schemas", { tags: ["ai", "issue-323"] }, () => {
  it.each(["editor@example.com", "editor+cms@example.co.nz"])(
    "accepts valid email %s for users and sign-in",
    (email) => {
      const user = { id: "editor", email, role: "admin" }

      expect(UserSchema.parse(user)).toEqual(user)
      expect(AddUserSchema.parse(user)).toEqual({ email, role: "admin" })
      expect(SignInSchema.parse({ email })).toEqual({ email })
    },
  )

  it.each(["", "editor", "editor@", "@example.com", "editor@example.com ", null, 123])(
    "rejects invalid email %s for users and sign-in",
    (email) => {
      const user = { id: "editor", email, role: "admin" }

      expect(UserSchema.safeParse(user).success).toBe(false)
      expect(AddUserSchema.safeParse(user).success).toBe(false)
      expect(SignInSchema.safeParse({ email }).success).toBe(false)
    },
  )

  it("preserves arbitrary page data fields", () => {
    const page = {
      key: "/test",
      data: {
        content: [{ type: "Heading", props: { id: "heading", title: "Test" } }],
        root: { props: { title: "Test page" } },
        custom: { enabled: true, values: [1, null, "value"] },
      },
      updatedAt: new Date("2026-10-13T00:00:00Z"),
      updatedBy: "editor",
    }

    expect(PageSchema.parse(page)).toEqual(page)
  })

  it.each([null, [], "content", 123])("rejects non-object page data %s", (data) => {
    expect(
      PageSchema.safeParse({
        key: "/test",
        data,
        updatedAt: new Date(),
        updatedBy: "editor",
      }).success,
    ).toBe(false)
  })
})

describe("defineOberonComponent", { tags: ["ai", "feature-component-typing"] }, () => {
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

    expectTypeOf<RenderProps["className"]>().toEqualTypeOf<string | undefined>()
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

        return image ? createElement("img", { alt: "", src: image.url }) : createElement("div")
      },
    })
  })
})
