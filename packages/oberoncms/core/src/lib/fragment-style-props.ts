import { migrate, walkTree, type Config, type Data } from "@puckeditor/core"
import { createElement } from "react"

import { withSharedComponent } from "../components/shared-component-render"
import type { OberonFragment } from "./dtd"
import { getNodeById, isSlotContent } from "./shared-components"

export function getFragmentStyleProps(fragments: OberonFragment[], config: Config) {
  const sharedComponents = fragments.filter((fragment) => fragment.type === "shared")
  const library = Object.fromEntries(sharedComponents.map(({ key, data }) => [key, data]))
  const sharedConfig = withSharedComponent(config, () => createElement("div"), library)
  const props: Record<string, unknown>[] = []
  const exposedClassKeys = new Set<string>()

  const collect = (data: Data) => {
    const stripped = walkTree(migrate(data, sharedConfig), sharedConfig, (content) => {
      for (const node of content) props.push(node.props)
      return []
    })
    props.push(stripped.root.props ?? stripped.root)
  }

  for (const fragment of fragments) {
    if (fragment.type === "page") {
      collect(fragment.data)
      continue
    }

    const { tree, exposures, defaults } = fragment.data
    collect(tree)
    for (const exposure of exposures) {
      if (exposure.prop === "className") exposedClassKeys.add(exposure.key)
      if (!Object.hasOwn(defaults, exposure.key)) continue
      const target = getNodeById(tree, sharedConfig, exposure.nodeId)
      const field = target && sharedConfig.components[target.type]?.fields?.[exposure.prop]
      const value = defaults[exposure.key]
      if (field?.type === "slot") {
        if (isSlotContent(value)) collect({ root: {}, content: value })
      } else {
        props.push({ [exposure.key]: value })
      }
    }
  }

  return { props, exposedClassKeys }
}
