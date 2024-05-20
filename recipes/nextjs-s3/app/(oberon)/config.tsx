import { PuckRichText } from "@tohuhono/puck-rich-text"
import { Image } from "@oberoncms/s3"
import { type OberonConfig } from "@oberoncms/core"
import { Dashboard } from "../../components/dashboard"

export const config: OberonConfig = {
  version: 1,
  components: {
    Box: {
      fields: {
        className: {
          type: "text",
        },
      },
      render: ({ className, puck: { renderDropZone: DropZone } }) => {
        return <div className={className}>{<DropZone zone="box" />}</div>
      },
    },
    Image,
    Text: {
      ...PuckRichText,
      render: (props) => (
        <div className="prose dark:prose-invert lg:prose-lg">
          {PuckRichText.render(props)}
        </div>
      ),
    },
    Dashboard: {
      render: () => <Dashboard />,
    },
  },
}
