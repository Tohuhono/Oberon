import type { Config, Data } from "@puckeditor/core"
import { PuckRichText, PuckRichTextProps } from "@tohuhono/puck-rich-text"

export const config: Config<{
  "Rich Text": PuckRichTextProps
}> = {
  root: {
    render: ({ children }) => (
      <div className="flex justify-center pt-10">
        <div className="prose">{children}</div>
      </div>
    ),
  },
  components: {
    "Rich Text": PuckRichText,
  },
}

export const initialData: Record<string, Data> = {
  "/": {
    content: [
      {
        props: {
          id: "Rich Text-dd72fdca-e66c-4402-ad2e-0a29f7a6ed45",
          state: {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Puck Rich Text Editor Demo App",
                      type: "text",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "heading",
                  version: 1,
                  tag: "h1",
                },
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Edit this page by adding /edit to the end of the URL",
                      type: "text",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1,
            },
          },
        },
        type: "Rich Text",
      },
    ],
    root: { props: { title: "Puck Rich Text Demo" } },
    zones: {},
  },
}
