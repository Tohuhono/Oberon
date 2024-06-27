"use client"

import dynamic from "next/dynamic"

const DDashboard = dynamic(
  () => import("../components/dashboard").then((m) => m.Dashboard),
  { ssr: false },
)

export function Dashboard() {
  return <DDashboard />
}
