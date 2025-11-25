import type { OberonPage } from "../lib/dtd"

export function getInitialData(): OberonPage {
  console.log("ddd")
  return {
    key: "/",
    data: {
      content: [{ type: "Welcome", props: { id: "Welcome-1" } }],
      root: { props: { title: "OberonCMS - Welcome" } },
      zones: {},
    },
    updatedAt: new Date(),
    updatedBy: "system",
  }
}
