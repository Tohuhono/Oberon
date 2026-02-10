import { PuckRichText, PuckRichTextProps } from "@tohuhono/puck-rich-text"
import type { OberonComponent, OberonConfig } from "@oberoncms/core"
import { Container } from "./blocks/container"
import { Dashboard } from "./dynamic/dashboard"
import { Welcome } from "./blocks/welcome"
import {
  CardsActivityGoal,
  CardsCalendar,
  CardsChat,
  CardsCookieSettings,
  CardsCreateAccount,
  CardsDataTable,
  CardsMetric,
  CardsPaymentMethod,
  CardsReportIssue,
  CardsShare,
  CardsStats,
  CardsTeamMembers,
} from "./dynamic/cards"

const cards = {
  "Activity Goal": {
    render: () => <CardsActivityGoal />,
  },
  Calendar: {
    render: () => <CardsCalendar />,
  },
  Chat: {
    render: () => <CardsChat />,
  },
  "Cookie Settings": {
    render: () => <CardsCookieSettings />,
  },
  "Create Account": {
    render: () => <CardsCreateAccount />,
  },
  "Data Table": {
    render: () => <CardsDataTable />,
  },
  Metric: {
    render: () => <CardsMetric />,
  },
  "Payment Method": {
    render: () => <CardsPaymentMethod />,
  },
  "Report Issue": {
    render: () => <CardsReportIssue />,
  },
  Share: {
    render: () => <CardsShare />,
  },
  Stats: {
    render: () => <CardsStats />,
  },
  "Team Members": {
    render: () => <CardsTeamMembers />,
  },
}

const Text: OberonComponent<PuckRichTextProps> = {
  ...PuckRichText,
  render: (props) => (
    <div className="prose dark:prose-invert lg:prose-lg p-1">
      {PuckRichText.render(props)}
    </div>
  ),
}

export function withExamples(config: Partial<OberonConfig>) {
  return {
    version: 1,
    ...config,
    categories: {
      other: { title: "Examples", defaultExpanded: true },
      ...config.categories,
      cards: {
        title: "Cards",
        defaultExpanded: false,
        components: Object.keys(cards),
      },
    },
    components: {
      ...config.components,
      Welcome,
      Container,
      Text,
      Dashboard: {
        render: () => <Dashboard />,
      },
      ...cards,
    },
  } satisfies OberonConfig
}
