import { type OberonConfig } from "../lib/dtd"
import { bootstrapAdapter } from "./init-adapter"

export async function bootstrapOberon({ client, plugins }: OberonConfig) {
  console.info("Bootstrap Oberon")

  await bootstrapAdapter({ client, plugins })
}
