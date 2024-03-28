#!/usr/bin/env node

import { readFile, mkdir, writeFile, copyFile, exists } from "fs/promises"
import path from "path"
import { glob } from "glob"

const verbose = false

const run = async () => {
  // Copy template files to the new directory
  const recipePath = path.join(import.meta.dirname, "../../../recipes")
  const templatePath = path.join(import.meta.dirname, "../templates")

  if (!(await exists(recipePath))) {
    console.error(`No recipe directory could be found at ${recipePath}.`)
    return
  }

  if (!(await exists(templatePath))) {
    console.error(`No template directory could be found at ${templatePath}.`)
    return
  }

  // Copy recipe files
  const recipeFiles = glob.sync(`**/*`, {
    cwd: recipePath,
    nodir: true,
    dot: true,
  })

  console.warn(
    `⚠️   The following files use handlebars templates. Please manually update them:`,
  )

  let counter = 0

  for (const recipeFile of recipeFiles) {
    const filePath = path.join(recipePath, recipeFile)

    const targetPath = filePath.replace(recipePath, templatePath)

    const isTemplated = await exists(`${targetPath}.hbs`)
    // Don't copy file if it's templated by handlebars
    if (isTemplated) {
      console.warn(`- ${recipeFile}`)
      return
    }

    if (verbose) {
      console.log(`Copying ${filePath} -> ${targetPath}`)
    }

    const data = await readFile(filePath, "utf-8")

    const dir = path.dirname(targetPath)

    await mkdir(dir, { recursive: true })

    await writeFile(targetPath, data)

    if (targetPath.indexOf(".gitignore") > -1) {
      await copyFile(
        filePath,
        targetPath.replace(".gitignore", "gitignore"), // rename .gitignore to gitignore so NPM publish doesn't ignore it
      )
    }

    counter += 1
  }

  console.log(`Copied ${counter} files into generator!`)
}

await run()
