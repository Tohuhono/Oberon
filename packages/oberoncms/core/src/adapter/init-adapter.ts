import { type OberonConfig } from "../lib/dtd"
import { composeAdapter } from "./compose-adapter"

export function initAdapter(config: OberonConfig) {
  console.info("Initialise Oberon adapter")
  return composeAdapter(config, "runtime").adapter
}
