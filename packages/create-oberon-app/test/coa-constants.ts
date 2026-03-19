import path from "node:path"

export const MONOREPO_ROOT = path.resolve(import.meta.dirname, "../../../")

export const COA_CONTAINER_NAME = "oberon-coa-e2e"
export const COA_CONTAINER_IMAGE = "oberon-coa-e2e:local"
export const COA_CONTAINER_PNPM_STORE_VOLUME = "oberon-coa-pnpm-store"
export const COA_CONTAINER_PNPM_STORE_PATH = "/pnpm/store"
export const COA_CONTAINER_ROOT = "/opt/coa"
export const COA_CONTAINER_SCAFFOLD_DIR = "/opt/coa/scaffold"

export const COA_VERDACCIO_PORT = 4873
export const COA_APP_PORT = 3000
export const COA_VERDACCIO_REGISTRY = `http://localhost:${COA_VERDACCIO_PORT}`

export const COA_APP_LOG_PATH = `${COA_CONTAINER_ROOT}/app.log`
export const COA_VERDACCIO_LOG_PATH = "/opt/verdaccio/verdaccio.log"

export const COA_AUTH_EMAIL = "test@tohuhono.com"

export const COA_AUTH_STATE_PATH = path.resolve(
  import.meta.dirname,
  "../.playwright/e2e-runtime/auth/storage-state.json",
)
