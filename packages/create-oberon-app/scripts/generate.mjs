#!/usr/bin/env node
// @ts-check

import { mkdir, copyFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import walk from "ignore-walk"
import fg from "fast-glob"

//
;(async () => {
  // Copy template files to the new directory
  const recipePath = path.join(import.meta.dirname, "..", "..", "..", "recipes")
  if (!existsSync(recipePath)) {
    console.error(`No recipe directory could be found at ${recipePath}.`)
    return
  }

  const pluginsPath = path.join(import.meta.dirname, "..", "plugins")
  const pluginsTargetPath = path.join(
    import.meta.dirname,
    "..",
    "dist",
    "plugins",
  )
  if (!existsSync(pluginsPath)) {
    console.error(`No plugins directory could be found at ${pluginsPath}.`)
    return
  }

  const templatePath = path.join(import.meta.dirname, "..", "templates")
  const templateTargetPath = path.join(
    import.meta.dirname,
    "..",
    "dist",
    "templates",
  )
  await mkdir(templatePath, { recursive: true })

  if (!existsSync(templatePath)) {
    console.error(
      `No template directory could be found at ${templateTargetPath}.`,
    )
    return
  }

  const pluginsFiles = await fg("**/*", { cwd: pluginsPath, onlyFiles: true })

  for (const pluginsFile of pluginsFiles) {
    const filePath = path.join(pluginsPath, pluginsFile)

    const targetPath = filePath.replace(pluginsPath, pluginsTargetPath)

    await mkdir(path.dirname(targetPath), { recursive: true })

    await copyFile(filePath, targetPath)
  }

  // Copy recipe files
  const recipeFiles = await walk({
    path: recipePath,
    ignoreFiles: [".gitignore"],
  })

  let counter = 0

  for (const recipeFile of recipeFiles) {
    const filePath = path.join(recipePath, recipeFile)

    const targetPath = filePath.replace(recipePath, templateTargetPath)

    await mkdir(path.dirname(targetPath), { recursive: true })

    if (targetPath.indexOf(".gitignore") > -1) {
      await copyFile(
        filePath,
        targetPath.replace(".gitignore", "gitignore"), // rename .gitignore to gitignore so NPM publish doesn't ignore it
      )
      counter += 1
      continue
    }

    await copyFile(filePath, targetPath)

    counter += 1
  }

  console.log(`Copied ${counter} files into generator!`)
})()
