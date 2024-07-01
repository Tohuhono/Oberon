import { PuckRichText, PuckRichTextProps } from "@tohuhono/puck-rich-text"
import type { OberonComponent } from "@oberoncms/core"
import { Container } from "./blocks/container"
import { Dashboard } from "./dynamic/dashboard"
import { Welcome } from "./blocks/welcome"

export default {
  Welcome,
  Container,
  Text: {
    ...PuckRichText,
    render: (...props) => (
      <div className="prose p-1 dark:prose-invert lg:prose-lg">
        {PuckRichText.render(...props)}
      </div>
    ),
  } satisfies OberonComponent<PuckRichTextProps>,
  Dashboard: {
    render: () => <Dashboard />,
  },
}
