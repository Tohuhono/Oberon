import path from "node:path"
import { mkdir } from "node:fs/promises"
import { expect, type Page } from "@playwright/test"

const LOGIN_PATH = "/cms/login"
const CALLBACK_PATH = "/cms/pages"

type DevelopmentOtpEntry = {
  token: string
  url?: string
}

type LoginFlowCommonOptions = {
  page: Page
  email: string
  storageStatePath?: string
}

type CompleteUiLoginWithOtpOptions = LoginFlowCommonOptions & {
  getLog: () => Promise<string>
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function parseDevelopmentOtpEntry(logs: string, email: string) {
  const escapedEmail = escapeRegExp(email)

  const withUrlAndToken = new RegExp(
    `sendVerificationRequest not sent in development[\\s\\S]*?email:\\s*["']${escapedEmail}["'][\\s\\S]*?url:\\s*["']([^"']+)["'][\\s\\S]*?token:\\s*["']?(\\d{6})["']?`,
    "g",
  )

  let lastEntry: DevelopmentOtpEntry | null = null

  for (const match of logs.matchAll(withUrlAndToken)) {
    const url = match[1]
    const token = match[2]

    if (token) {
      lastEntry = {
        token,
        url,
      }
    }
  }

  if (lastEntry) {
    return lastEntry
  }

  const fromTokenField = new RegExp(
    `sendVerificationRequest not sent in development[\\s\\S]*?email:\\s*["']${escapedEmail}["'][\\s\\S]*?token:\\s*["']?(\\d{6})["']?`,
    "g",
  )

  let lastMatch: string | null = null

  for (const match of logs.matchAll(fromTokenField)) {
    const token = match[1]
    if (token) {
      lastMatch = token
    }
  }

  if (lastMatch) {
    return { token: lastMatch }
  }

  const fromUrlField = new RegExp(
    `sendVerificationRequest not sent in development[\\s\\S]*?email:\\s*["']${escapedEmail}["'][\\s\\S]*?url:\\s*["'][^"']*token=(\\d{6})`,
    "g",
  )

  for (const match of logs.matchAll(fromUrlField)) {
    const token = match[1]
    if (token) {
      lastMatch = token
    }
  }

  return lastMatch ? { token: lastMatch } : null
}

async function pollDevelopmentOtpEntry({
  email,
  readLogs,
}: {
  email: string
  readLogs: () => Promise<string>
}) {
  const deadline = Date.now() + 20_000

  while (Date.now() < deadline) {
    const logs = await readLogs()
    const entry = parseDevelopmentOtpEntry(logs, email)

    if (entry) {
      return entry
    }

    await sleep(500)
  }

  throw new Error(`Timed out waiting 20000ms for OTP token for ${email}`)
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }
  return String(error)
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
  } catch (error) {
    const currentPathname = new URL(page.url()).pathname
    throw new Error(
      `Auth completion did not reach ${expectedPathname}. Current path: ${currentPathname}. Callback status: ${callbackStatus}. Callback location: ${callbackLocation ?? "<none>"}.`,
    )
  }
}

export async function completeUiLoginWithOtp(
  options: CompleteUiLoginWithOtpOptions,
): Promise<{ token: string }> {
  const { page, email, storageStatePath, getLog } = options

  try {
    const initialLoginUrl = new URL(LOGIN_PATH, "http://localhost")
    initialLoginUrl.searchParams.set("callbackUrl", CALLBACK_PATH)

    await page.goto(`${initialLoginUrl.pathname}${initialLoginUrl.search}`)

    const emailInput = page.getByRole("textbox").first()
    await expect(emailInput).toBeEditable()
    await emailInput.fill(email)

    const initialLogs = await getLog()
    const initialLogLength = initialLogs.length

    await page.getByRole("button", { name: "Sign in" }).click()

    const otpEntry = await pollDevelopmentOtpEntry({
      email,
      readLogs: async () => {
        const currentLogs = await getLog()
        if (currentLogs.length <= initialLogLength) {
          return currentLogs.length === initialLogLength ? "" : currentLogs
        }

        return currentLogs.slice(initialLogLength)
      },
    })

    const { token, url: completionUrl } = otpEntry

    const completionLoginUrl = new URL(LOGIN_PATH, "http://localhost")
    completionLoginUrl.searchParams.set("callbackUrl", CALLBACK_PATH)
    completionLoginUrl.searchParams.set("email", email)
    completionLoginUrl.searchParams.set("token", token)

    await page.goto(
      completionUrl ??
        `${completionLoginUrl.pathname}${completionLoginUrl.search}`,
    )

    await completeSignIn(page)

    if (storageStatePath) {
      await mkdir(path.dirname(storageStatePath), { recursive: true })
      await page.context().storageState({ path: storageStatePath })
    }

    return {
      token,
    }
  } catch (error) {
    throw new Error(`UI auth bootstrap failed. ${formatError(error)}`)
  }
}
