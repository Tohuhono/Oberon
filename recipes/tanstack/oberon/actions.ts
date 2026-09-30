import { createActionHandler } from "@oberoncms/core/adapter"

import { adapter } from "./adapter"

export const actions = createActionHandler(adapter)
