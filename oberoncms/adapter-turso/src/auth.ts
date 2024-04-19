import { initAuth } from "@oberoncms/auth"
import { adapter } from "./db/next-auth-adapter"

export const { handlers, auth } = initAuth(adapter)
