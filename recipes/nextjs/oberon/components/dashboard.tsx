"use client";

import dynamic from "next/dynamic";

const DCDashboard = dynamic(
  () =>
    import("@datacom-digital/ui-sample-components").then((m) => m.Dashboard),
  { ssr: false },
);

export function Dashboard() {
  return <DCDashboard />;
}
