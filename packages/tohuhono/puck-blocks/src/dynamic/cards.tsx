"use client"

import dynamic from "next/dynamic"

export const CardsActivityGoal = dynamic(
  () =>
    import("../components/cards/activity-goal").then(
      (m) => m.CardsActivityGoal,
    ),
  { ssr: false },
)
export const CardsCalendar = dynamic(
  () => import("../components/cards/calendar").then((m) => m.CardsCalendar),
  { ssr: false },
)
export const CardsChat = dynamic(
  () => import("../components/cards/chat").then((m) => m.CardsChat),
  { ssr: false },
)
export const CardsCookieSettings = dynamic(
  () =>
    import("../components/cards/cookie-settings").then(
      (m) => m.CardsCookieSettings,
    ),
  { ssr: false },
)
export const CardsCreateAccount = dynamic(
  () =>
    import("../components/cards/create-account").then(
      (m) => m.CardsCreateAccount,
    ),
  { ssr: false },
)
export const CardsDataTable = dynamic(
  () => import("../components/cards/data-table").then((m) => m.CardsDataTable),
  { ssr: false },
)
export const CardsMetric = dynamic(
  () => import("../components/cards/metric").then((m) => m.CardsMetric),
  { ssr: false },
)
export const CardsPaymentMethod = dynamic(
  () =>
    import("../components/cards/payment-method").then(
      (m) => m.CardsPaymentMethod,
    ),
  { ssr: false },
)
export const CardsReportIssue = dynamic(
  () =>
    import("../components/cards/report-issue").then((m) => m.CardsReportIssue),
  { ssr: false },
)
export const CardsShare = dynamic(
  () => import("../components/cards/share").then((m) => m.CardsShare),
  { ssr: false },
)
export const CardsStats = dynamic(
  () => import("../components/cards/stats").then((m) => m.CardsStats),
  { ssr: false },
)
export const CardsTeamMembers = dynamic(
  () =>
    import("../components/cards/team-members").then((m) => m.CardsTeamMembers),
  { ssr: false },
)
