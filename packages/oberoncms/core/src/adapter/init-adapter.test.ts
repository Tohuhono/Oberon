import { afterEach, describe, expect, it } from "@dev/vitest"
import { vi } from "vitest"
import {
  ResponseError,
  type OberonConfig,
  type OberonPage,
  type OberonPageUpdate,
  type OberonSite,
  type OberonTailwindAsset,
  type OberonTailwindUpdate,
} from "../lib/dtd"
import { baseAccumulator } from "./init-plugins"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  unstable_cache: <TArgs extends unknown[], TResult>(
    callback: (...args: TArgs) => TResult,
  ) => callback,
}))

vi.mock("./tailwind-assets", async () => {
  const actual =
    await vi.importActual<typeof import("./tailwind-assets")>(
      "./tailwind-assets",
    )

  return {
    ...actual,
    buildTailwindAsset: vi.fn(async ({ classList }) => ({
      hash: classList.join("__"),
      classList,
      css: `:root { --classes: '${classList.join(" ")}'; }`,
    })),
  }
})

const { buildTailwindAsset } = await import("./tailwind-assets")
const { initAdapter } = await import("./init-adapter")

const config = {
  version: 1,
  components: {},
} as OberonConfig

const adminUser = {
  id: "user-1",
  email: "admin@example.com",
  role: "admin" as const,
}

function createPage(key: string, className?: string): OberonPage {
  return {
    key: key as OberonPage["key"],
    data: {
      content: className
        ? [{ type: "Text", props: { id: `${key}-1`, className } }]
        : [],
      root: { props: { title: key } },
      zones: {},
    },
    updatedAt: new Date("2026-03-26T00:00:00.000Z"),
    updatedBy: adminUser.email,
  }
}

function createSite(activeTailwindHash: string | null): OberonSite {
  return {
    version: 1,
    components: {},
    activeTailwindHash,
    updatedAt: new Date("2026-03-26T00:00:00.000Z"),
    updatedBy: "system",
  }
}

function createHarness({
  driftOnTailwindCommit = false,
  pages = [],
  site,
  tailwindAssets = [],
}: {
  driftOnTailwindCommit?: boolean
  pages?: OberonPage[]
  site?: OberonSite
  tailwindAssets?: OberonTailwindAsset[]
} = {}) {
  const state = {
    site,
    pages: new Map(pages.map((page) => [page.key, page])),
    tailwindAssets: new Map(
      tailwindAssets.map((tailwindAsset) => [
        tailwindAsset.hash,
        tailwindAsset,
      ]),
    ),
  }

  let shouldDriftOnTailwindCommit = driftOnTailwindCommit

  const pluginAdapter = {
    ...baseAccumulator.adapter,
    getCurrentUser: async () => adminUser,
    hasPermission: () => true,
    signIn: async () => {},
    signOut: async () => {},
    prebuild: async () => {},
    getAllImages: async () => [],
    getAllPages: async () => {
      return [...state.pages.values()].map(({ key, updatedAt, updatedBy }) => ({
        key,
        updatedAt,
        updatedBy,
      }))
    },
    getAllUsers: async () => [adminUser],
    getPageData: async (key: string) => state.pages.get(key)?.data ?? null,
    getSite: async () => state.site,
    getTailwindAsset: async (hash: string) =>
      state.tailwindAssets.get(hash) ?? null,
    updatePageData: async ({
      activeTailwindHash,
      baselineActiveTailwindHash,
      key,
      data,
      tailwindAsset,
      updatedAt,
      updatedBy,
    }: OberonPageUpdate) => {
      const nextPage = { key, data, updatedAt, updatedBy } satisfies OberonPage

      if (activeTailwindHash === undefined) {
        state.pages.set(key, nextPage)
        return
      }

      if (shouldDriftOnTailwindCommit) {
        shouldDriftOnTailwindCommit = false
        state.site = createSite("drifted-hash")
      }

      const currentActiveTailwindHash = state.site?.activeTailwindHash ?? null

      if (
        baselineActiveTailwindHash !== undefined &&
        currentActiveTailwindHash !== baselineActiveTailwindHash
      ) {
        throw new ResponseError(
          "Tailwind asset state changed while publishing. Please retry.",
        )
      }

      if (tailwindAsset) {
        state.tailwindAssets.set(tailwindAsset.hash, tailwindAsset)
      }

      state.pages.set(key, nextPage)
      state.site = {
        ...(state.site ?? createSite(null)),
        activeTailwindHash,
        updatedAt,
        updatedBy,
      }
    },
    updateSite: async (nextSite: OberonSite) => {
      state.site = nextSite
    },
    updateTailwind: async ({
      activeTailwindHash,
      baselineActiveTailwindHash,
      tailwindAsset,
      updatedAt,
      updatedBy,
    }: OberonTailwindUpdate) => {
      const currentActiveTailwindHash = state.site?.activeTailwindHash ?? null

      if (
        baselineActiveTailwindHash !== undefined &&
        currentActiveTailwindHash !== baselineActiveTailwindHash
      ) {
        throw new ResponseError(
          "Tailwind asset state changed while publishing. Please retry.",
        )
      }

      state.tailwindAssets.set(tailwindAsset.hash, tailwindAsset)
      state.site = {
        ...(state.site ?? createSite(null)),
        activeTailwindHash,
        updatedAt,
        updatedBy,
      }
    },
  }

  const adapter = initAdapter({
    config,
    tailwind: { sourceCssFile: "/ignored.css" },
    versions: [],
    pluginAdapter,
  })

  return { adapter, state }
}

describe("initAdapter tailwind assets", { tags: ["ai", "issue-314"] }, () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("builds and activates an immutable asset during prebuild when published content uses classes", async () => {
    const publishedPage = createPage("/published", "text-lg bg-red-500")
    const harness = createHarness({
      pages: [publishedPage],
      site: createSite(null),
    })

    await harness.adapter.prebuild()

    expect(vi.mocked(buildTailwindAsset)).toHaveBeenCalledOnce()
    expect(harness.state.site?.activeTailwindHash).toBe("bg-red-500__text-lg")
    expect(harness.state.tailwindAssets.get("bg-red-500__text-lg")).toEqual({
      hash: "bg-red-500__text-lg",
      classList: ["bg-red-500", "text-lg"],
      css: ":root { --classes: 'bg-red-500 text-lg'; }",
    })
  })

  it("leaves the active tailwind hash null when prebuild finds no published classes", async () => {
    const harness = createHarness({
      pages: [createPage("/published")],
      site: createSite(null),
    })

    await harness.adapter.prebuild()

    expect(vi.mocked(buildTailwindAsset)).not.toHaveBeenCalled()
    expect(harness.state.site?.activeTailwindHash).toBeNull()
    expect(harness.state.tailwindAssets.size).toBe(0)
  })

  it("keeps old assets fetchable after publish activates a new hash", async () => {
    const oldAsset = {
      hash: "text-lg",
      classList: ["text-lg"],
      css: ":root { --classes: 'text-lg'; }",
    } satisfies OberonTailwindAsset
    const harness = createHarness({
      pages: [createPage("/published", "text-lg")],
      site: createSite(oldAsset.hash),
      tailwindAssets: [oldAsset],
    })

    const result = await harness.adapter.publishPageData({
      key: "/published",
      data: createPage("/published", "text-lg bg-red-500").data,
    })

    expect(result).toEqual({ message: "Successfully published /published" })
    expect(harness.state.site?.activeTailwindHash).toBe("bg-red-500__text-lg")
    expect(harness.state.tailwindAssets.get(oldAsset.hash)).toEqual(oldAsset)
    expect(
      await harness.adapter.getTailwindAsset("bg-red-500__text-lg"),
    ).toEqual({
      hash: "bg-red-500__text-lg",
      classList: ["bg-red-500", "text-lg"],
      css: ":root { --classes: 'bg-red-500 text-lg'; }",
    })
  })

  it("fails publish when the active hash drifts before the atomic commit", async () => {
    const oldPage = createPage("/published", "text-lg")
    const harness = createHarness({
      driftOnTailwindCommit: true,
      pages: [oldPage],
      site: createSite("text-lg"),
      tailwindAssets: [
        {
          hash: "text-lg",
          classList: ["text-lg"],
          css: ":root { --classes: 'text-lg'; }",
        },
      ],
    })

    await expect(
      harness.adapter.publishPageData({
        key: "/published",
        data: createPage("/published", "text-lg bg-red-500").data,
      }),
    ).rejects.toThrow(
      "Tailwind asset state changed while publishing. Please retry.",
    )

    expect(harness.state.pages.get("/published")).toEqual(oldPage)
    expect(harness.state.site?.activeTailwindHash).toBe("drifted-hash")
    expect(harness.state.tailwindAssets.has("bg-red-500__text-lg")).toBe(false)
  })
})
