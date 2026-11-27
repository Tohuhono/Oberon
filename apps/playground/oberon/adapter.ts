import "server-cli-only"
import { initOberon } from "@oberoncms/core/render"

import { config } from "./config"

export const { adapter, RenderPage } = initOberon(config)
