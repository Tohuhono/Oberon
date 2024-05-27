#!/usr/bin/env node
// @ts-check

import { readFile, mkdir, writeFile, copyFile } from "fs/promises"
import { existsSync, statSync } from "fs"
import path from "path"
import walk from "ignore-walk"
import { glob } from "glob"

const verbose = false

;(async () => {
  // Copy template files to the new directory
  const recipePath = path.join(import.meta.dirname, "../../../recipes")
  const templatePath = path.join(import.meta.dirname, "../templates")
  const handlebarsPath = path.join(import.meta.dirname, "../handlebars")

  if (!existsSync(recipePath)) {
    console.error(`No recipe directory could be found at ${recipePath}.`)
    return
  }

  if (!existsSync(handlebarsPath)) {
    console.error(`No template directory could be found at ${templatePath}.`)
    return
  }

  const handlebarsFiles = await glob("**/*.hbs", { cwd: handlebarsPath })

  for (const handlebarsFile of handlebarsFiles) {
    const filePath = path.join(handlebarsPath, handlebarsFile)

    const targetPath = filePath.replace(handlebarsPath, templatePath)

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

    const targetPath = filePath.replace(recipePath, templatePath)

    // Don't copy file if it's templated by handlebars
    if (existsSync(`${targetPath}.hbs`)) {
      console.warn(`Templated ${recipeFile}`)
      continue
    }

    await mkdir(path.dirname(targetPath), { recursive: true })

    await copyFile(filePath, targetPath)

    if (targetPath.indexOf(".gitignore") > -1) {
      await copyFile(
        filePath,
        targetPath.replace(".gitignore", "gitignore"), // rename .gitignore to gitignore so NPM publish doesn't ignore it
      )
    }

    counter += 1
  }

  console.log(`Copied ${counter} files into generator!`)
})()
