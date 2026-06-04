"use server"

import { actions as oberonActions } from "./adapter"

export async function addImage(...props: Parameters<typeof oberonActions.addImage>) {
  return oberonActions.addImage(...props)
}

export async function addPage(...props: Parameters<typeof oberonActions.addPage>) {
  return oberonActions.addPage(...props)
}

export async function addUser(...props: Parameters<typeof oberonActions.addUser>) {
  return oberonActions.addUser(...props)
}

export async function can(...props: Parameters<typeof oberonActions.can>) {
  return oberonActions.can(...props)
}

export async function changeRole(...props: Parameters<typeof oberonActions.changeRole>) {
  return oberonActions.changeRole(...props)
}

export async function deleteImage(...props: Parameters<typeof oberonActions.deleteImage>) {
  return oberonActions.deleteImage(...props)
}

export async function deletePage(...props: Parameters<typeof oberonActions.deletePage>) {
  return oberonActions.deletePage(...props)
}

export async function deleteUser(...props: Parameters<typeof oberonActions.deleteUser>) {
  return oberonActions.deleteUser(...props)
}

export async function getAllImages(...props: Parameters<typeof oberonActions.getAllImages>) {
  return oberonActions.getAllImages(...props)
}

export async function getAllPages(...props: Parameters<typeof oberonActions.getAllPages>) {
  return oberonActions.getAllPages(...props)
}

export async function getAllPaths(...props: Parameters<typeof oberonActions.getAllPaths>) {
  return oberonActions.getAllPaths(...props)
}

export async function getAllUsers(...props: Parameters<typeof oberonActions.getAllUsers>) {
  return oberonActions.getAllUsers(...props)
}

export async function getConfig(...props: Parameters<typeof oberonActions.getConfig>) {
  return oberonActions.getConfig(...props)
}

export async function getPageData(...props: Parameters<typeof oberonActions.getPageData>) {
  return oberonActions.getPageData(...props)
}

export async function migrateData(...props: Parameters<typeof oberonActions.migrateData>) {
  return oberonActions.migrateData(...props)
}

export async function publishPageData(...props: Parameters<typeof oberonActions.publishPageData>) {
  return oberonActions.publishPageData(...props)
}

export async function signIn(...props: Parameters<typeof oberonActions.signIn>) {
  return oberonActions.signIn(...props)
}

export async function signOut(...props: Parameters<typeof oberonActions.signOut>) {
  return oberonActions.signOut(...props)
}
