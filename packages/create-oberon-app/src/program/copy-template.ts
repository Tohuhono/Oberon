import { existsSync } from "fs"
import { copyFile, mkdir } from "fs/promises"
import path from "path"
import fg from "fast-glob"

export async function copyTemplate(
  appName: string,
  appPath: string,
  templatePath: string,
) {
  if (existsSync(appPath)) {
    console.error(
      `A directory called ${appName} already exists. Please use a different name or delete this directory.`,
    )
    return
  }

  await mkdir(appName, { recursive: true })

  const templateFiles = await fg(`**/*`, {
    cwd: templatePath,
    onlyFiles: true,
    dot: true,
  })

  for (const templateFile of templateFiles) {
    const filePath = path.join(templatePath, templateFile)
    const targetPath = filePath
      .replace(templatePath, appPath)
      .replace("gitignore", ".gitignore") // Rename gitignore back to .gitignore (.gitignore) gets ignored by npm during publish

    await mkdir(path.dirname(targetPath), { recursive: true })
    await copyFile(filePath, targetPath)
  }
}
