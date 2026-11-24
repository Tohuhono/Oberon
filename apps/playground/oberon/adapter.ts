import "server-cli-only"
import { initOberon } from "@oberoncms/core/render"

import { config } from "./config"

export const { adapter, getPage, RenderPage } = initOberon(config)
