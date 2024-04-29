import { databaseAdapter } from "@oberoncms/adapter-turso"
import { initAdapter } from "@oberoncms/core/adapter"
import { getRole } from "./auth"

export const adapter = initAdapter({ db: databaseAdapter, getRole })
