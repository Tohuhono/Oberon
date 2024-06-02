#!/usr/bin/env tsx
// @ts-check

import path from "path"
import { globbyStream } from "globby"

const kebabCaseRegex = /^[a-z][a-z0-9.]*([-/][a-z0-9.]*)*$/

for await (const file of globbyStream("**", {
  gitignore: true,
  ignore: ["**/CHANGELOG*", "**/README*", "**/LICENSE*", "**/db/migrations/**"],
})) {
  if (kebabCaseRegex.test(file as string)) {
    // regular kebab case
    continue
  }
  if (/^.*\/app\/.*[()[\]-]*$/.test(file as string)) {
    if (/^.*\/app\/.*[()[\]-]*$/.test(file as string)) {
      continue
    }

    console.log("() ", (file as string).split("/app/").join(" "))

    continue
  }
  console.log("!  ", path)
}
