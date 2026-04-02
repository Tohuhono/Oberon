import path from "node:path"
import { mkdir } from "node:fs/promises"
import { stripVTControlCharacters } from "node:util"
import { expect, type Page } from "@playwright/test"

const LOGIN_PATH = "/cms/login"
const CALLBACK_PATH = "/cms/pages"

function parseDevelopmentOtpEntry(logs: string): string | null {
  const strippedLog = stripVTControlCharacters(logs)
  const tokenPattern = /token:\s*["']?(\d{6})["']?/g

  let lastMatch: string | null = null

  for (const match of strippedLog.matchAll(tokenPattern)) {
    const token = match[1]
    if (token) {
      lastMatch = token
    }
  }

  return lastMatch
}

async function pollDevelopmentOtpEntry({
  email,
  readLogs,
}: {
  email: string
  readLogs: () => Promise<string>
}) {
  let token: string | null = null

  await expect
    .poll(
      async () => {
        token = parseDevelopmentOtpEntry(await readLogs())
        return token
      },
      {
        timeout: 20_000,
        intervals: [250, 500, 1_000],
        message: `Expected development OTP token for ${email}`,
      },
    )
    .toMatch(/^\d{6}$/)

  if (token) {
    return token
  }

  throw new Error(`Timed out waiting 20000ms for OTP token for ${email}`)
}

async function completeSignIn(page: Page) {
  const completeSignInButton = page.getByRole("button", {
    name: "Complete Sign in",
  })

  await expect(completeSignInButton).toBeVisible()

  const callbackResponsePromise = page.waitForResponse((response) =>
    response.url().includes("/cms/api/auth/callback/email?"),
  )

  await completeSignInButton.click()

  const callbackResponse = await callbackResponsePromise
  const callbackStatus = callbackResponse.status()
  const callbackLocation = await callbackResponse.headerValue("location")

  if (callbackStatus >= 400) {
    throw new Error(
      `Auth callback failed with status ${callbackStatus} ${callbackResponse.statusText()}`,
    )
  }

  const expectedPathname = CALLBACK_PATH

  try {
    await expect.poll(() => new URL(page.url()).pathname).toBe(expectedPathname)
  } catch {
    const currentPathname = new URL(page.url()).pathname
    throw new Error(
      `Auth completion did not reach ${expectedPathname}. Current path: ${currentPathname}. Callback status: ${callbackStatus}. Callback location: ${callbackLocation ?? "<none>"}.`,
    )
  }
}

export async function completeUiLoginWithOtp({
  page,
  email,
  storageStatePath,
  getLog,
}: {
  page: Page
  email: string
  storageStatePath: string
  getLog: () => Promise<string>
}): Promise<{ token: string }> {
  const initialLoginUrl = new URL(LOGIN_PATH, "http://localhost")
  initialLoginUrl.searchParams.set("callbackUrl", CALLBACK_PATH)

  await page.goto(`${initialLoginUrl.pathname}${initialLoginUrl.search}`)

  const emailInput = page.getByRole("textbox").first()
  await expect(emailInput).toBeEditable()
  await emailInput.fill(email)

  const initialLogs = await getLog()
  const initialLogLength = initialLogs.length

  const signInResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/cms/api/auth/signin/email"),
  )

  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(await signInResponsePromise).toBeOK()

  const token = await pollDevelopmentOtpEntry({
    email,
    readLogs: async () => {
      const currentLogs = await getLog()
      if (currentLogs.length <= initialLogLength) {
        return currentLogs.length === initialLogLength ? "" : currentLogs
      }

      return currentLogs.slice(initialLogLength)
    },
  })

  const completionLoginUrl = new URL(LOGIN_PATH, "http://localhost")
  completionLoginUrl.searchParams.set("callbackUrl", CALLBACK_PATH)
  completionLoginUrl.searchParams.set("email", email)
  completionLoginUrl.searchParams.set("token", token)

  await page.goto(`${completionLoginUrl.pathname}${completionLoginUrl.search}`)

  await completeSignIn(page)

  await mkdir(path.dirname(storageStatePath), { recursive: true })
  await page.context().storageState({ path: storageStatePath })

  return {
    token,
  }
}
