import { base, defineConfig } from "@dev/playwright"
import {
  COA_APP_LOG_PATH,
  COA_AUTH_EMAIL,
  COA_AUTH_STATE_PATH,
} from "./test/coa-constants"
import { readContainerFile } from "./test/coa-runtime"

const authProject = {
  name: "auth",
  testMatch: "dev/playwright/helpers/setup-auth.spec.ts",
  grep: /@auth/,
  use: {
    authEmail: COA_AUTH_EMAIL,
    authStorageStatePath: COA_AUTH_STATE_PATH,
    readLog: async () => readContainerFile(COA_APP_LOG_PATH),
  },
}

export default defineConfig({
  ...base,
  globalSetup: "./test/global-setup.ts",
  testDir: "../..",
  workers: 1,
  use: { ...base.use, baseURL: "http://localhost:3000" },
  projects: [
    authProject,
    {
      name: "authenticated",
      testMatch: [
        "apps/playground/test/smoke.spec.ts",
        "apps/playground/test/cms-*.spec.ts",
        "packages/create-oberon-app/test/provenance.spec.ts",
      ],
      grep: /@cms|@smoke|@coa/,
      dependencies: [authProject.name],

      use: {
        storageState: COA_AUTH_STATE_PATH,
      },
    },
    {
      name: "login",
      testMatch: "apps/playground/test/cms-login.spec.ts",
      grep: /@login/,
    },
  ],
})
