#!/usr/bin/env node

import path from "path"
import { execSync } from "child_process"
import validateName from "validate-npm-package-name"

import {
  program,
  Option,
  InvalidArgumentError,
} from "@commander-js/extra-typings"
import { initGit } from "./installer/init-git"
import { installPackages, packageManagers } from "./installer/install-packages"

import { promptOptions, recipes } from "./installer/prompt-options"
import { installTemplate } from "./installer/install-template"
import { installEnv } from "./installer/install-env"
import {
  databaseIds,
  databasePlugins,
  installAdapter,
  sendIds,
  sendPlugins,
  Plugin,
} from "./installer/install-adapter"

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
    new Option("--database <database>", "Database plugin").choices(databaseIds),
  )
  .addOption(
    new Option(
      "--dir <directory>",
      "Target directory (defaults to project name)",
    ),
  )
  .addOption(new Option("--send <send>", "Send plugin").choices(sendIds))
  .action(async (_appName, options) => {
    // Ask for options
    const { appName, recipe, database, email, send, packageManager } =
      await promptOptions(_appName, options)

    const templatePath = path.join(import.meta.dirname, "templates", recipe)
    const pluginPath = path.join(import.meta.dirname, "plugins")
    const appPath = options.dir || path.join(process.cwd(), appName)
    const oberonPath = path.join(appPath, "oberon")

    const plugins: Plugin[] = [
      {
        id: database,
        type: "database",
        ...databasePlugins[database],
      },
      {
        id: send,
        type: "send",
        ...sendPlugins[send],
      },
    ]

    await installTemplate(appName, appPath, templatePath)

    await installAdapter(oberonPath, pluginPath, plugins)

    await installEnv(appPath, email)

    await installPackages({
      appName,
      appPath,
      packageManager,
      plugins,
    })

    execSync(`${packageManager} run prettier:fix`, {
      cwd: appPath,
      stdio: "inherit",
    })

    execSync(`${packageManager} run prebuild`, {
      cwd: appPath,
      stdio: "inherit",
    })

    initGit(appPath)
  })
  .parse(process.argv)
