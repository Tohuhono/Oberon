#!/usr/bin/env node

import { readFile, mkdir, writeFile, copyFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { execSync } from "child_process"
import { exit } from "process"
import crypto from "crypto"
import prompts from "prompts"
import handlebars from "handlebars"
import { glob } from "glob"
import { z } from "zod"
import validateName from "validate-npm-package-name"

import {
  program,
  Option,
  InvalidArgumentError,
} from "@commander-js/extra-typings"

const recipes = ["nextjs"] as const
const recipeChoices = [{ title: "Next js", value: "nextjs" }]

const databases = ["vercel-postgres", "pgsql", "turso", "none"] as const
const databasePlugins: Record<
  (typeof databases)[number],
  { label: string; package: string }
> = {
  "vercel-postgres": {
    label: "Vercel Postgres",
    package: "@oberoncms/plugin-vercel-postgres",
  },
  turso: {
    label: "Turso",
    package: "@oberoncms/plugin-turso",
  },
  pgsql: {
    label: "PostgreSQL",
    package: "@oberoncms/plugin-pgsql",
  },
  none: {
    label: "None",
    package: "",
  },
}
const databaseChoices = databases.map((key) => ({
  title: databasePlugins[key].label,
  value: key,
}))

const sendPlugins = ["resend", "sendgrid", "custom"] as const
const sendChoices = [
  { title: "Resend", value: "resend" },
  { title: "Sendgrid", value: "sendgrid" },
  { title: "Custom", value: "custom" },
]

const packageManagers = ["npm", "pnpm", "yarn"] as const
const packageManagerChoices = [
  { title: "npm", value: "npm" },
  { title: "pnpm", value: "pnpm" },
  { title: "yarn", value: "yarn" },
]

// Lifted from https://github.com/vercel/next.js/blob/c2d7bbd1b82c71808b99e9a7944fb16717a581db/packages/create-next-app/helpers/get-pkg-manager.ts
function getPkgManager() {
  const userAgent = process.env.npm_config_user_agent || ""

  if (userAgent.startsWith("yarn")) {
    return "yarn"
  }

  if (userAgent.startsWith("pnpm")) {
    return "pnpm"
  }

  if (userAgent.startsWith("npm")) {
    return "npm"
  }

  return undefined
}

function existsGit(cwd: string) {
  try {
    return execSync("git status", { cwd }).toString().indexOf("fatal:") !== 0
  } catch {
    return false
  }
}

function onCancel() {
  exit(0)
}

program
  .command("create")
  .argument("[app-name]", "project name", (value, _): string => {
    const { errors } = validateName(value)
    if (errors) {
      throw new InvalidArgumentError("\n" + errors.join("\n"))
    }
    return value
  })
  .addOption(
    new Option(
      "--use <package manager>",
      "Explicitly tell the CLI to bootstrap the application using <package manager>",
    ).choices(packageManagers),
  )
  .option("--email <email>", "Master email (initial admin user)")
  .addOption(
    new Option("--recipe <recipe>", "Base recipe to use").choices(recipes),
  )
  .addOption(
    new Option("--database <database>", "Database plugin").choices(databases),
  )
  .addOption(new Option("--send <send>", "Send plugin").choices(sendPlugins))
  .action(async (_appName, options) => {
    prompts.override({
      appName: _appName,
      packageManager: options.use || getPkgManager(),
      ...options,
    })

    const {
      appName,
      recipe,
      database,
      email,
      send,
      packageManager,
    }: {
      appName: string
      recipe: string
      database: (typeof databases)[number]
      email: string
      send: string
      packageManager: string
    } = await prompts(
      [
        {
          type: "text" as const,
          name: "appName",
          message: "What is the name of your app?",
          initial: "oberon",
          validate: (value: string) => {
            const { validForNewPackages, errors } = validateName(value)
            return validForNewPackages || errors?.join(", ") || false
          },
        },
        {
          type: "text" as const,
          name: "email",
          message:
            "Master email - this user has superadmin priviledges for the cms",
          initial: options.email,
          validate: (value: string) => {
            const { success, error } = z.string().email().safeParse(value)
            return success || error.format()._errors.join(", ")
          },
        },
        {
          type: "select" as const,
          name: "packageManager",
          message: "Package Manager",
          choices: packageManagerChoices,
        },
        {
          type: "select" as const,
          name: "recipe",
          message: "Which recipe would you like to use?",
          choices: recipeChoices,
        },
        {
          type: "select" as const,
          name: "database",
          message: "Which database would you like to use?",
          choices: databaseChoices,
        },
        {
          type: "select" as const,
          name: "send",
          message: "Which send plugin would you like to use?",
          choices: sendChoices,
        },
      ],
      { onCancel },
    )

    const dynamicDependencies = [] as string[]
    const dynamicDevDependencies = [] as string[]

    const databasePluginPackage = databasePlugins[database].package

    const templatePath = path.join(import.meta.dirname, "templates", recipe)
    const sendPath = path.join(import.meta.dirname, "plugins", "send")
    const appPath = path.join(process.cwd(), appName)
    const oberonPath = path.join(appPath, "oberon")

    if (existsSync(appPath)) {
      console.error(
        `A directory called ${appName} already exists. Please use a different name or delete this directory.`,
      )
      return
    }

    /*
     * Copy and apply template files into new directory
     */

    await mkdir(appName, { recursive: true })

    // Compile handlebars templates
    const templateFiles = await glob(`**/*`, {
      cwd: templatePath,
      nodir: true,
      dot: true,
    })

    for (const templateFile of templateFiles) {
      const filePath = path.join(templatePath, templateFile)
      const targetPath = filePath
        .replace(templatePath, appPath)
        .replace(".hbs", "")
        .replace("gitignore", ".gitignore") // Rename gitignore back to .gitignore (.gitignore) gets ignored by npm during publish

      await mkdir(path.dirname(targetPath), { recursive: true })

      if (path.extname(filePath) === ".hbs") {
        const templateString = await readFile(filePath, "utf-8")

        const template = handlebars.compile(templateString)
        const data = template({
          databasePluginPackage,
        })

        await writeFile(targetPath, data)

        continue
      }

      await copyFile(filePath, targetPath)
    }

    /*
     * Send plugin
     */

    await copyFile(
      path.join(sendPath, `${send}.ts`),
      path.join(oberonPath, `send.ts`),
    )

    /*
     * Create .env.local
     * TODO: vercel secrets
     */

    await writeFile(
      path.join(appPath, "./.env.local"),
      `
MASTER_EMAIL=${email}
EMAIL_FROM=${email}

AUTH_SECRET=${crypto.randomBytes(64).toString("hex")}

# Development builds
RESEND_USE_REMOTE=false
AUTH_TRUST_HOST=true
ANALYZE=false
      `,
    )

    /*
     * Adjust package.json
     */

    const packageFilePath = path.join(appPath, "./package.json")

    const packageJson = JSON.parse(
      await readFile(packageFilePath, "utf-8"),
    ) as {
      name?: string
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    const dependencies =
      packageJson.dependencies || ({} as Record<string, string>)
    const devDependencies =
      packageJson.devDependencies || ({} as Record<string, string>)

    for (const dependancy in dependencies) {
      if (dependencies[dependancy]?.startsWith("workspace")) {
        dynamicDependencies.push(dependancy)
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete dependencies[dependancy]
      }
    }

    for (const dependancy in devDependencies) {
      if (devDependencies[dependancy]?.startsWith("workspace")) {
        dynamicDevDependencies.push(dependancy)
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete devDependencies[dependancy]
      }
    }

    dynamicDependencies.push(databasePluginPackage)

    await writeFile(
      packageFilePath,
      JSON.stringify({
        ...packageJson,
        name: appName,
        dependencies,
        devDependencies,
      }),
    )

    execSync(`${packageManager} install ${dynamicDependencies.join(" ")}`, {
      cwd: appPath,
      stdio: "inherit",
    })

    execSync(`${packageManager} run prebuild`, {
      cwd: appPath,
      stdio: "inherit",
    })

    // Only commit if this is a new repo
    if (!existsGit(appPath)) {
      try {
        execSync("git init", { cwd: appPath, stdio: "inherit" })

        execSync("git add .", { cwd: appPath, stdio: "inherit" })
        execSync('git commit -m "build(puck): generate app"', {
          cwd: appPath,
          stdio: "inherit",
        })
      } catch (error) {
        console.error("Failed to commit git changes", error)
      }
    }
  })
  .parse(process.argv)
