import { type OberonConfig } from "@oberoncms/core"
import exampleComponents from "@tohuhono/puck-blocks/example"
import { Welcome } from "@/oberon/components/welcome"
import { Container } from "@/oberon/components/container"

export const config: OberonConfig = {
  version: 1,
  components: {
    Welcome,
    Container,
    Text: {
      fields: {
        text: {
          type: "text",
        },
      },
      render: ({ text }) => (
        <div className="prose dark:prose-invert lg:prose-lg">{text}</div>
      ),
    },
    ...exampleComponents,
  },
}
