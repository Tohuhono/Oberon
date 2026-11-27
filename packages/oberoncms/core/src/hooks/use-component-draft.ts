import type { Config } from "@puckeditor/core"
import { encode } from "@tohuhono/utils"
import { useLocalStorage } from "@tohuhono/utils/use-local-storage"
import { useRef, useState, useSyncExternalStore } from "react"
import { z } from "zod"

import { PuckDataSchema } from "../lib/dtd"

const pageDraftSchema = z.union([
  z.object({ data: PuckDataSchema, baseUpdatedAt: z.iso.datetime().nullable() }),
  PuckDataSchema.transform((data) => ({ data, baseUpdatedAt: null })),
])

function pageDraftKey(path: string, config: Config) {
  return `${encode(Object.keys(config.components).join("-"))}:${path}`
}

export function usePageDraft(path: string, config: Config) {
  return useComponentDraft(pageDraftKey(path, config), pageDraftSchema)
}

export function clearPageDraft(path: string, config: Config) {
  localStorage.removeItem(`oberon:${pageDraftKey(path, config)}`)
}

function useComponentDraft<Draft>(storageKey: string, schema: z.ZodType<Draft>) {
  const [draft, setDraft] = useLocalStorage(storageKey, {
    parser(raw) {
      if (!raw) return null
      try {
        const parsed = schema.safeParse(JSON.parse(raw))
        return parsed.success ? parsed.data : null
      } catch {
        return null
      }
    },
  })

  return { draft, setDraft }
}

const subscribe = () => () => {}
export function useBrowserDraftsReady() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

export function useDraftPublication<T>({
  draft,
  setDraft,
  updatedAt,
}: {
  draft: { data: T; baseUpdatedAt: string | null } | null
  setDraft: (draft: { data: T; baseUpdatedAt: string | null } | null) => void
  updatedAt: Date | null
}) {
  const [baseUpdatedAt, setBaseUpdatedAt] = useState(
    draft ? draft.baseUpdatedAt : updatedAt && new Date(updatedAt).toISOString(),
  )
  const published = updatedAt && new Date(updatedAt).toISOString()
  const [previousPublication, setPreviousPublication] = useState<string | null>()
  const pendingData = useRef<T | null>(null)

  const saveDraft = (data: T) => {
    pendingData.current = data
    setDraft({ data, baseUpdatedAt })
  }

  const publish = async (write: (expectedUpdatedAt?: Date) => Promise<{ updatedAt: Date }>) => {
    const previousDraft = pendingData.current
    const result = await write(baseUpdatedAt ? new Date(baseUpdatedAt) : undefined)
    const nextBase = new Date(result.updatedAt).toISOString()
    setBaseUpdatedAt(nextBase)
    setPreviousPublication(published)
    setDraft(
      pendingData.current !== null && pendingData.current !== previousDraft
        ? { data: pendingData.current, baseUpdatedAt: nextBase }
        : null,
    )
  }

  const isStale = !!(draft && baseUpdatedAt !== published && previousPublication !== published)
  const acceptCurrentPublication = () => {
    setBaseUpdatedAt(published)
    if (draft) setDraft({ ...draft, baseUpdatedAt: published })
  }
  const discardDraft = () => {
    setDraft(null)
    window.location.reload()
  }

  return { saveDraft, publish, isStale, acceptCurrentPublication, discardDraft }
}
