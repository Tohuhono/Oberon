import type { OberonPage } from "../lib/dtd"

export function getInitialData(): OberonPage {
  return {
    key: "/",
    data: {
      content: [
        { type: "Text", props: { id: "Text-1", text: "Welcome to OberonCMS" } },
      ],
      root: { props: { title: "OberonCMS - Welcome" } },
      zones: {},
    },
    updatedAt: new Date(),
    updatedBy: "system",
  }
}
