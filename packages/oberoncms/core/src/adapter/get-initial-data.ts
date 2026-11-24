import type { OberonFragment } from "../lib/dtd"

export function getInitialData(): OberonFragment {
  return {
    key: "/",
    type: "page",
    data: {
      content: [
        { type: "Welcome", props: { id: "Welcome-1" } },
        { type: "Text", props: { id: "Text-1", text: "Welcome to OberonCMS" } },
      ],
      root: { props: { title: "OberonCMS - Welcome" } },
      zones: {},
    },
    updatedAt: new Date(),
    updatedBy: "system",
  }
}
