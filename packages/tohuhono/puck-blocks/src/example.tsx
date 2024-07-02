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

export function withExamples(config: OberonConfig): OberonConfig {
  return {
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
      ...cards,
    },
  }
}
