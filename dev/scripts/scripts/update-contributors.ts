#!/usr/bin/env tsx

import { execSync } from "child_process"
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const REPO = requireEnv("CONTRIBUTORS_REPO")
const HEADING = process.env.CONTRIBUTORS_HEADING || "## Contributors"
const README_PATH = resolve(process.env.CONTRIBUTORS_README || "./README.md")
const COMMIT_MESSAGE =
  process.env.CONTRIBUTORS_COMMIT_MESSAGE || "docs(README): update contributors"
const COLUMNS_PER_ROW = 6
const IMG_WIDTH = 100
const FONT_SIZE = 14

interface ContributorApi {
  login: string
  avatar_url: string
  html_url: string
  type: string
}

interface Contributor extends ContributorApi {
  name: string
}

function githubHeaders(): Record<string, string> {
  const token = process.env.GH_TOKEN
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: githubHeaders() })
  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    )
  }
  return response.json() satisfies Promise<T>
}

async function fetchDisplayName(login: string): Promise<string> {
  try {
    const data = await fetchJson<{ name?: string }>(
      `https://api.github.com/users/${login}`,
    )
    return data.name || login
  } catch {
    return login
  }
}

async function fetchContributors(): Promise<Contributor[]> {
  const raw: ContributorApi[] = []
  let page = 1

  while (true) {
    const data = await fetchJson<ContributorApi[]>(
      `https://api.github.com/repos/${REPO}/contributors?per_page=100&page=${page}`,
    )
    if (data.length === 0) break

    raw.push(...data)
    page++
  }

  const users = raw.filter(
    (c) => c.type === "User" && !c.login.includes("[bot]"),
  )

  return Promise.all(
    users.map(async (c) => ({
      ...c,
      name: await fetchDisplayName(c.login),
    })),
  )
}

function buildCell(contributor: Contributor): string {
  return `    <td align="center" style="word-wrap: break-word; width: 150.0; height: 150.0">
        <a href=${contributor.html_url}>
            <img src=${contributor.avatar_url} width="${IMG_WIDTH};"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=${contributor.name}/>
            <br />
            <sub style="font-size:${FONT_SIZE}px"><b>${contributor.name}</b></sub>
        </a>
    </td>`
}

function buildTable(contributors: Contributor[]): string {
  const rows: string[] = []

  for (let i = 0; i < contributors.length; i += COLUMNS_PER_ROW) {
    const cells = contributors
      .slice(i, i + COLUMNS_PER_ROW)
      .map(buildCell)
      .join("\n")
    rows.push(`<tr>\n${cells}\n</tr>`)
  }

  return `<table>\n${rows.join("\n")}\n</table>\n`
}

const contributors = await fetchContributors()
const table = buildTable(contributors)

const readme = readFileSync(README_PATH, "utf-8")
const headingIndex = readme.indexOf(HEADING)

if (headingIndex === -1) {
  throw new Error(`Heading "${HEADING}" not found in README.md`)
}

const updated = readme.slice(0, headingIndex) + HEADING + "\n\n" + table
writeFileSync(README_PATH, updated)

console.log(
  `Updated contributors: ${contributors.map((c) => c.login).join(", ")}`,
)

execSync("git add README.md", { stdio: "inherit" })

const hasChanges =
  execSync("git diff --staged --quiet || echo changed").toString().trim() ===
  "changed"

if (hasChanges) {
  execSync(
    `git config user.name "github-actions[bot]" && git config user.email "github-actions[bot]@users.noreply.github.com"`,
    { stdio: "inherit" },
  )
  execSync(`git commit -m "${COMMIT_MESSAGE}"`, { stdio: "inherit" })
  execSync("git push", { stdio: "inherit" })
  console.log("Committed and pushed contributor changes")
} else {
  console.log("No contributor changes to commit")
}
