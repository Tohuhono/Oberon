import { type OberonConfig } from "@oberoncms/core";
import { Dashboard } from "@/oberon/components/dashboard";
import { Welcome } from "@/oberon/components/welcome";
import { Container } from "@/oberon/components/container";

export const config: OberonConfig = {
  version: 1,
  components: {
    Welcome,
    Container,
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
};
