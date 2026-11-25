import { createUsePuck, type Data } from "@puckeditor/core"
import { z } from "zod"

import {
  SharedComponentDataSchema,
  SharedExposureSchema,
  type SharedComponentData,
} from "../lib/dtd"

const usePuck = createUsePuck()
const settingsKey = "oberonSharedSource"
const settingsSchema = SharedComponentDataSchema.omit({ tree: true }).extend({
  name: z.string(),
  exposures: z.array(SharedExposureSchema.extend({ label: z.string() })),
})
export const sharedSourceDraftSchema = settingsSchema.extend({
  tree: SharedComponentDataSchema.shape.tree,
})

export function withSourceSettings(tree: Data, settings: Omit<SharedComponentData, "tree">): Data {
  const props = { ...tree.root.props, [settingsKey]: settings }
  return { ...tree, root: { ...tree.root, props } }
}

export function readSourceDraft(data: Data): SharedComponentData {
  const rootProps: Record<string, unknown> = data.root.props ?? {}
  const { [settingsKey]: settings, ...props } = rootProps
  return {
    ...settingsSchema.parse(settings),
    tree: { ...data, root: { ...data.root, props } },
  }
}

export function useSharedSourceSettings() {
  const settings = settingsSchema.parse(
    usePuck((state) => state.appState.data.root.props?.[settingsKey]),
  )
  const dispatch = usePuck((state) => state.dispatch)
  const updateSettings = (changes: Partial<typeof settings>) => {
    dispatch({
      type: "setData",
      data: (previous) => withSourceSettings(previous, { ...settings, ...changes }),
      recordHistory: true,
    })
  }
  return { settings, updateSettings }
}
