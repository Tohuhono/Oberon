#!/usr/bin/env node
import path from "path"
import { rimraf } from "rimraf"

const outputs = [
  "./dist",
  "./node_modules",
  "./.rollup.cache",
  "./.turbo",
  "./.next",
  "./.vercel",
  "./tsconfig.tsbuildinfo",
]

globalThis.console.warn(`rm [${outputs}] in ${path.resolve()}`)

rimraf([
  "./dist",
  "./node_modules",
  "./.rollup.cache",
  "./.turbo",
  "./.next",
  "./.vercel",
  "./tsconfig.tsbuildinfo",
])
