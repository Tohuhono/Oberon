import { initAuth } from "@oberoncms/auth"
import { authAdapter } from "@oberoncms/adapter-turso/auth"
export const { handlers, auth } = initAuth(authAdapter)

export { actions } from "@oberoncms/adapter-turso"
