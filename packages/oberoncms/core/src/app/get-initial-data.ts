import type { OberonPage } from "./schema"

export function getInitialData(): OberonPage {
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
