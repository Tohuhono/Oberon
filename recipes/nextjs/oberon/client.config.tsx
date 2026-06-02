import { type OberonClientConfig } from "@oberoncms/core"

export const clientConfig: OberonClientConfig = {
  version: 1,
  components: {
    Text: {
      fields: {
        text: {
          type: "text",
        },
      },
      defaultProps: {
        text: "Welcome to OberonCMS",
      },
      render: ({ text }) => <div className="prose dark:prose-invert lg:prose-lg">{text}</div>,
    },
  },
}
