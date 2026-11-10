import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { test, vi } from "@dev/vitest"
import {
  INITIAL_DATA,
  type FragmentData as Data,
  type OberonClientConfig,
  type OberonPlugin,
  type OberonUser,
} from "@oberoncms/core"
import { createActionHandler, initAdapter } from "@oberoncms/core/adapter"
import { createAdapterTest, createStorageAdapterFactory } from "@oberoncms/testing"
import { Render } from "@puckeditor/core/rsc"
import { renderToStaticMarkup } from "react-dom/server"

import { plugin } from "./index"
import {
  SHARED_METADATA,
  SharedLibrarySchema,
  createDefinition,
  type SharedDefinition,
} from "./model"

const config: OberonClientConfig = {
  version: 1,
  components: {
    Text: {
      fields: { text: { type: "text" }, className: { type: "text" } },
      render: ({ text, className }) => <p className={className}>{text}</p>,
    },
    Container: {
      fields: { content: { type: "slot" } },
      render: ({ content: Content }) => <Content />,
    },
  },
}

const createStorage = createStorageAdapterFactory({
  sqliteFile: resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../../.tmp/shared-components-plugin.test.db",
  ),
})
const sharedTest = createAdapterTest(test).extend(
  "adapter",
  { scope: "worker" },
  // oxlint-disable-next-line no-empty-pattern
  async ({}, { onCleanup }) => createStorage(onCleanup),
)

function createRuntime(
  storage: Awaited<ReturnType<typeof createStorage>>,
  user: OberonUser | null = {
    id: "author",
    email: "author@example.com",
    role: "admin",
  },
  extra: OberonPlugin[] = [],
) {
  const contentChanged = vi.fn(async () => {})
  const adapter = initAdapter({
    client: config,
    plugins: [
      () => ({
        name: "test-storage",
        adapter: {
          addFragment: () => storage.addFragment,
          updateFragmentData: () => storage.updateFragmentData,
          deleteFragment: () => storage.deleteFragment,
          getAllFragments: () => storage.getAllFragments,
          getFragmentData: () => storage.getFragmentData,
          getFragmentRevision: () => storage.getFragmentRevision,
          getCurrentUser: () => async () => user,
          notFound: () => () => {
            throw new Error("Not found")
          },
          contentChanged: () => contentChanged,
        },
      }),
      plugin(config),
      ...extra,
    ],
  })
  return { adapter, contentChanged, actions: createActionHandler(adapter) }
}

function source(name: string) {
  const definition = createDefinition(name)
  definition.data.content = [
    { type: "Text", props: { id: "shared", text: "Shared design", className: "p-2" } },
    { type: "Text", props: { id: "headline", text: "Default headline" } },
  ]
  definition.exposures = {
    headline: { node: "headline", prop: "text", kind: "prop", label: "Headline" },
  }
  definition.data.root.props = {
    ...definition.data.root.props,
    [SHARED_METADATA]: { name, exposures: definition.exposures },
  }
  return definition
}

function content(data: Data, index = 0) {
  const node = data.content[index]
  if (!node) throw new Error(`Missing component at content index ${index}`)
  return node
}

async function writeSource(
  adapter: ReturnType<typeof createRuntime>["adapter"],
  definition: SharedDefinition,
  data: Data = definition.data,
) {
  return adapter.handleRequest(
    new Request("http://oberon.test/cms/api/shared-components", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://oberon.test" },
      body: JSON.stringify({ id: definition.id, data, expectedUpdatedAt: definition.updatedAt }),
    }),
    { method: "POST", path: ["shared-components"] },
  )
}

async function published(response: Response, id: string) {
  if (!response.ok) throw new Error(await response.text())
  const library = SharedLibrarySchema.parse(await response.json())
  const definition = library.definitions.find((item) => item.id === id)
  if (!definition) throw new Error(`Missing published source "${id}"`)
  return definition
}

sharedTest.describe(
  "Fragment-backed Shared components",
  { tags: ["ai", "feature-shared-components"] },
  () => {
    sharedTest.beforeEach(async ({ adapter }) => {
      for (const fragment of await adapter.getAllFragments({})) {
        await adapter.deleteFragment({ key: fragment.key, type: fragment.type })
      }
    })

    sharedTest(
      "contributes exposed className values from instance-owned slots and legacy zones",
      async ({ adapter: storage, expect }) => {
        const { adapter } = createRuntime(storage)
        const definition = source("Styled article")
        definition.exposures.classes = {
          node: "headline",
          prop: "className",
          kind: "prop",
          label: "Classes",
        }
        definition.data.root.props = {
          [SHARED_METADATA]: { name: definition.name, exposures: definition.exposures },
        }
        const saved = await published(await writeSource(adapter, definition), definition.id)
        expect(
          await adapter.getContentClasses({
            fragments: [
              {
                root: {},
                content: [
                  {
                    type: "Container",
                    props: {
                      id: "container",
                      content: [
                        {
                          type: "SharedComponent",
                          props: {
                            id: "nested",
                            definitionId: saved.id,
                            classes: "p-17 md:p-19",
                            headline: "Do not compile ordinary text",
                          },
                        },
                      ],
                    },
                  },
                ],
                zones: {
                  "legacy:body": [
                    {
                      type: "SharedComponent",
                      props: { id: "legacy", definitionId: saved.id, classes: "p-23" },
                    },
                  ],
                },
              },
            ],
          }),
        ).toEqual(["p-17", "md:p-19", "p-23"])
      },
    )

    sharedTest(
      "uses the composed lifecycle for Pages and route-free Fragments without Page route leakage",
      async ({ adapter: storage, expect }) => {
        const { adapter, actions } = createRuntime(storage)
        expect(await actions.addFragment({ key: "/page", type: "page" })).toMatchObject({
          status: "success",
        })
        expect(await actions.addFragment({ key: "route-free", type: "fixture" })).toMatchObject({
          status: "success",
        })
        expect(
          await actions.publishFragmentData({
            key: "route-free",
            type: "fixture",
            data: INITIAL_DATA,
          }),
        ).toMatchObject({ status: "success" })
        expect(await actions.getAllFragments({ type: "fixture" })).toMatchObject({
          status: "success",
          result: [{ key: "route-free", type: "fixture", updatedBy: "author@example.com" }],
        })
        expect(await adapter.getFragmentData({ key: "route-free" })).toEqual(INITIAL_DATA)
        expect(await adapter.getAllPaths()).toEqual([{ path: ["page"] }])
        await expect(actions.resolvePath({ key: "route-free" })).rejects.toThrow("Not found")
        expect(await actions.addFragment({ key: "not-a-path", type: "page" })).toMatchObject({
          status: "error",
        })
        expect(await actions.deleteFragment({ key: "route-free", type: "fixture" })).toMatchObject({
          status: "success",
        })
        expect(await adapter.getFragmentData({ key: "route-free" })).toBeNull()
      },
    )

    sharedTest(
      "publishes current shared design without rewriting or republishing consumer Pages",
      async ({ adapter: storage, expect }) => {
        const { adapter, actions, contentChanged } = createRuntime(storage)
        const draft = source("Article")
        const first = await published(await writeSource(adapter, draft), draft.id)
        const page: Data = {
          root: { props: { title: "Consumer metadata" } },
          content: [
            {
              type: "SharedComponent",
              props: { id: "one", definitionId: first.id, headline: "First" },
            },
            {
              type: "SharedComponent",
              props: { id: "two", definitionId: first.id, headline: "Second" },
            },
          ],
        }
        expect(
          await actions.publishFragmentData({ key: "/consumer", type: "page", data: page }),
        ).toMatchObject({ status: "success" })
        const originalMeta = await adapter.getAllFragments({ type: "page" })
        const updated = structuredClone(first.data)
        content(updated).props.text = "Updated shared design"
        content(updated, 1).props.text = "Updated default"
        const saved = await published(await writeSource(adapter, first, updated), first.id)

        expect(saved.updatedBy).toBe("author@example.com")
        expect(saved.updatedAt).not.toBe(first.updatedAt)
        expect(await adapter.getAllFragments({ type: "page" })).toEqual(originalMeta)
        expect(await adapter.getFragmentData({ key: "/consumer" })).toEqual(page)
        const prepared = await adapter.prepareContent({ config, data: page })
        const html = renderToStaticMarkup(<Render config={prepared.config} data={prepared.data} />)
        expect(html.match(/Updated shared design/g)).toHaveLength(2)
        expect(html).toContain("First")
        expect(html).toContain("Second")
        expect(html).not.toContain("Updated default")
        expect(contentChanged).toHaveBeenCalledTimes(2)
        await expect(actions.resolvePath({ key: first.id })).rejects.toThrow("Not found")
        expect(await adapter.getAllPaths()).toEqual([{ path: ["consumer"] }])
      },
    )

    sharedTest(
      "rejects stale source writes and preserves the newer publication",
      async ({ adapter: storage, expect }) => {
        const { adapter } = createRuntime(storage)
        const draft = source("Stale")
        const first = await published(await writeSource(adapter, draft), draft.id)
        const newData = structuredClone(first.data)
        content(newData).props.text = "New publication"
        await published(await writeSource(adapter, first, newData), first.id)
        const stale = await writeSource(adapter, first)
        expect(stale.status).toBe(409)
        expect(await stale.text()).toContain("Reload")
        expect((await adapter.getFragmentData({ key: first.id }))?.content[0]?.props.text).toBe(
          "New publication",
        )
      },
    )

    sharedTest(
      "rejects a concurrently introduced reference cycle atomically",
      async ({ adapter: storage, expect }) => {
        const { adapter } = createRuntime(storage)
        const a = source("A")
        const b = source("B")
        const first = await published(await writeSource(adapter, a), a.id)
        const second = await published(await writeSource(adapter, b), b.id)
        const firstData = {
          ...first.data,
          content: [{ type: "SharedComponent", props: { id: "to-b", definitionId: second.id } }],
        }
        const secondData = {
          ...second.data,
          content: [{ type: "SharedComponent", props: { id: "to-a", definitionId: first.id } }],
        }
        firstData.root.props = {
          ...firstData.root.props,
          [SHARED_METADATA]: { name: "A", exposures: {} },
        }
        secondData.root.props = {
          ...secondData.root.props,
          [SHARED_METADATA]: { name: "B", exposures: {} },
        }
        const responses = await Promise.all([
          writeSource(adapter, first, firstData),
          writeSource(adapter, second, secondData),
        ])
        expect(responses.map((response) => response.status).sort()).toEqual([200, 409])
        await expect(
          adapter.prepareContent({ config, data: INITIAL_DATA }),
        ).resolves.toHaveProperty("data")
      },
    )

    sharedTest(
      "protects references in root slots and legacy zones when deleting a source",
      async ({ adapter: storage, expect }) => {
        const { adapter } = createRuntime(storage)
        const draft = source("Protected")
        const first = await published(await writeSource(adapter, draft), draft.id)
        await adapter.updateFragmentData({
          key: "route-free-consumer",
          type: "fixture",
          data: {
            root: {
              props: {
                aside: [
                  { type: "SharedComponent", props: { id: "root-ref", definitionId: first.id } },
                ],
              },
            },
            content: [],
          },
          updatedAt: new Date(),
          updatedBy: "author@example.com",
        })
        const remove = () =>
          adapter.handleRequest(
            new Request("http://oberon.test/cms/api/shared-components", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: first.id, expectedUpdatedAt: first.updatedAt }),
            }),
            { method: "DELETE", path: ["shared-components"] },
          )
        let response = await remove()
        expect(response.status).toBe(409)
        expect(await response.text()).toContain("route-free-consumer")
        await storage.updateFragmentData({
          key: "route-free-consumer",
          type: "fixture",
          data: {
            root: {},
            content: [],
            zones: {
              "legacy:body": [
                { type: "SharedComponent", props: { id: "zone-ref", definitionId: first.id } },
              ],
            },
          },
          updatedAt: new Date(),
          updatedBy: "author@example.com",
        })
        response = await remove()
        expect(response.status).toBe(409)
        expect(await response.text()).toContain("route-free-consumer")
        await adapter.deleteFragment({ key: "route-free-consumer", type: "fixture" })
        expect((await remove()).status).toBe(200)
        expect(await adapter.getFragmentData({ key: first.id })).toBeNull()
      },
    )

    sharedTest(
      "keeps configured read policy and denies unauthorised or cross-site publication",
      async ({ adapter: storage, expect }) => {
        const publicRuntime = createRuntime(storage, null)
        const request = new Request("http://oberon.test/cms/api/shared-components")
        const response = await publicRuntime.adapter.handleRequest(request, {
          method: "GET",
          path: ["shared-components"],
        })
        expect(response.status).toBe(200)
        expect(SharedLibrarySchema.parse(await response.json()).canWrite).toBe(false)
        expect((await writeSource(publicRuntime.adapter, source("Denied"))).status).toBe(403)
        expect(
          await publicRuntime.actions.publishFragmentData({
            key: "private",
            type: "fixture",
            data: INITIAL_DATA,
          }),
        ).toMatchObject({ status: "error" })
        const { adapter } = createRuntime(storage)
        const forged = await adapter.handleRequest(
          new Request(request.url, {
            method: "POST",
            headers: { Origin: "http://other.test", "Content-Type": "application/json" },
            body: JSON.stringify({
              id: "shared:forged",
              data: INITIAL_DATA,
              expectedUpdatedAt: null,
            }),
          }),
          { method: "POST", path: ["shared-components"] },
        )
        expect(forged.status).toBe(409)
        expect(await storage.getAllFragments({})).toEqual([])
      },
    )
  },
)
