import type { Page } from "@playwright/test"
import { completeUiLoginWithOtp } from "@dev/playwright/helpers/bootstrap"
import { COA_APP_LOG_PATH, COA_AUTH_EMAIL } from "./coa-constants"
import { readContainerFile, readContainerLogTail } from "./coa-runtime"

export async function loginThroughUiWithOtp({
  page,
  storageStatePath,
}: {
  page: Page
  storageStatePath?: string
}) {
  try {
    return await completeUiLoginWithOtp({
      page,
      email: COA_AUTH_EMAIL,
      getLog: () => readContainerFile(COA_APP_LOG_PATH),
      storageStatePath,
    })
  } catch (error) {
    const appLogTail = await readContainerLogTail(COA_APP_LOG_PATH, 120)

    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\n\nApp log tail:\n${appLogTail}`,
    )
  }
}
