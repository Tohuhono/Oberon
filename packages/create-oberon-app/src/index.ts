#!/usr/bin/env node

import path from "path"
import { execSync } from "child_process"
import validateName from "validate-npm-package-name"

import {
  program,
  Option,
  InvalidArgumentError,
} from "@commander-js/extra-typings"
import { initGit } from "./program/init-git"
import { installPackages } from "./program/install-packages"
import {
  databaseIds,
  databasePlugins,
  packageManagers,
  Plugin,
  recipes,
  sendIds,
  sendPlugins,
} from "./program/config"
import { promptOptions } from "./program/prompt-options"
import { copyTemplate } from "./program/copy-template"
import { writeEnv } from "./program/write-env"
import { updatePackageJson } from "./program/update-package"
import { writePlugins } from "./program/write-plugins"

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
  .addOption(new Option("--send <send>", "Send plugin").choices(sendIds))
  .action(async (_appName, options) => {
    // Ask for options
    const { appName, recipe, database, email, send, packageManager } =
      await promptOptions(_appName, options)

    const templatePath = path.join(import.meta.dirname, "templates", recipe)
    const pluginPath = path.join(import.meta.dirname, "plugins")
    const appPath = path.join(process.cwd(), appName)
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

    /*
     * Copy and apply template files into new directory
     */
    await copyTemplate(appName, appPath, templatePath)

    await writePlugins(oberonPath, pluginPath, plugins)

    /*
     * Adjust package.json
     */
    const { workspaceDeps, workspaceDevDeps } = await updatePackageJson(
      appName,
      appPath,
    )

    await writeEnv(appPath, email)

    const pluginDependencies = plugins.flatMap(
      ({ packageName, dependencies = [] }) => [
        ...dependencies,
        ...(packageName ? [packageName] : []),
      ],
    )

    installPackages({
      packageManager,
      appPath,
      dependencies: [...workspaceDeps, ...pluginDependencies],
      devDependencies: workspaceDevDeps,
    })

    execSync(`${packageManager} run prebuild`, {
      cwd: appPath,
      stdio: "inherit",
    })

    initGit(appPath)
  })
  .parse(process.argv)
