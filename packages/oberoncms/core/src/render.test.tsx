import { describe, expect, it, vi } from "@dev/vitest"
import { renderToStaticMarkup } from "react-dom/server"

import { type OberonFragment, type OberonPlugin } from "./lib/dtd"
import { initOberon } from "./render"

const instance = (id: string, definitionId: string) => ({
  type: "SharedComponent",
  props: { id, definitionId },
})

describe("RenderPage", { tags: ["ai", "feature-shared-components"] }, () => {
  it("uses the runtime config and reads current nested Shared components on each render", async () => {
    const metadata = { updatedAt: new Date(), updatedBy: "author" }
    const page: OberonFragment = {
      ...metadata,
      key: "/about",
      type: "page",
      data: { root: { props: {} }, content: [instance("header-instance", "header")] },
    }
    const header: OberonFragment = {
      ...metadata,
      key: "header",
      type: "shared",
      data: {
        name: "Header",
        tree: { root: { props: {} }, content: [instance("logo-instance", "logo")] },
        exposures: [],
        defaults: {},
      },
    }
    const logo: OberonFragment = {
      ...metadata,
      key: "logo",
      type: "shared",
      data: {
        name: "Logo",
        tree: { root: { props: {} }, content: [{ type: "Text", props: { id: "logo-text" } }] },
        exposures: [],
        defaults: {},
      },
    }
    const read = vi.fn(
      async ({ key }: { key: string }) =>
        [page, header, logo].find((fragment) => fragment.key === key) ?? null,
    )
    const plugin: OberonPlugin = () => ({
      name: "published-content",
      adapter: {
        getAllFragments: () => async () => [header, logo],
        getFragmentData: () => read,
      },
    })
    const { getPage, RenderPage } = initOberon({
      client: {
        version: 1,
        components: { Text: { render: ({ text }) => <strong>{text}</strong> } },
      },
      plugins: [plugin],
    })

    const loadedPage = await getPage({ key: page.key })
    for (const text of ["First logo", "Published logo"]) {
      logo.data.tree.content = [{ type: "Text", props: { id: "logo-text", text } }]
      const render = await RenderPage({ page: loadedPage })
      expect(renderToStaticMarkup(render)).toContain(`<strong>${text}</strong>`)
    }
    expect(read.mock.calls.filter(([input]) => input.key === page.key)).toHaveLength(1)
  })

  it("does not read published content when Page read is denied", async () => {
    const read = vi.fn(async () => null)
    const plugin: OberonPlugin = () => ({
      name: "private-content",
      adapter: {
        hasPermission: () => () => false,
        getCurrentUser: () => async () => null,
        getFragmentData: () => read,
      },
    })
    const { getPage } = initOberon({
      client: { version: 1, components: {} },
      plugins: [plugin],
    })

    await expect(getPage({ key: "/private" })).rejects.toThrow(
      "You do not have permission to perform this action",
    )
    expect(read).not.toHaveBeenCalled()
  })
})
