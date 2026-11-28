import { componentTag, type ComponentType, type OberonPlugin } from "@oberoncms/core"
import { nextCookies } from "better-auth/next-js"
import { revalidatePath, updateTag, unstable_cache as cache } from "next/cache"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { connection } from "next/server"

import { name, version } from "../package.json" with { type: "json" }

export { createRestHandler } from "./handler"

const componentListTag = (type: ComponentType) => `oberon-components-${type}`

async function refreshComponent({ key, type }: { key: string; type: ComponentType }) {
  updateTag(await componentTag(key))
  updateTag(componentListTag(type))

  if (type === "page") {
    revalidatePath(key)
    revalidatePath(`/cms/edit${key}`)
    revalidatePath(`/cms/preview${key}`)
  }
}

export const plugin: OberonPlugin = ({ phase }) => {
  return {
    name,
    version,
    adapter:
      phase === "runtime"
        ? {
            redirect:
              () =>
              ({ href }) =>
                redirect(href),
            notFound: () => notFound,
            getRequestHeaders: () => async () => {
              await connection()
              return headers()
            },
            getAuthPlugins:
              ({ next }) =>
              () => [...next(), nextCookies()],
            updateComponent:
              ({ next }) =>
              async (component) => {
                await next(component)
                await refreshComponent(component)
              },
            addComponent:
              ({ next }) =>
              async (component) => {
                await next(component)
                await refreshComponent(component)
              },
            deleteComponent:
              ({ getAdapter, next }) =>
              async ({ key }) => {
                const component = await getAdapter().getComponent({ key })
                await next({ key })
                if (component) await refreshComponent(component)
              },
            updateSite:
              ({ next }) =>
              async (site) => {
                await next(site)
                updateTag("oberon-config")
              },
            addImage:
              ({ next }) =>
              async (image) => {
                await next(image)
                updateTag("oberon-images")
              },
            deleteImage:
              ({ next }) =>
              async (data) => {
                await next(data)
                updateTag("oberon-images")
              },
            addUser:
              ({ next }) =>
              async (user) => {
                const createdUser = await next(user)
                updateTag("oberon-users")
                return createdUser
              },
            deleteUser:
              ({ next }) =>
              async (data) => {
                await next(data)
                updateTag("oberon-users")
              },
            changeRole:
              ({ next }) =>
              async (data) => {
                await next(data)
                updateTag("oberon-users")
              },
            getComponent:
              ({ next }) =>
              async ({ key }) =>
                cache(next, ["oberon-get-component"], { tags: [await componentTag(key)] })({
                  key,
                }),
            listComponents:
              ({ next }) =>
              (type) =>
                cache(next, ["oberon-list-components"], { tags: [componentListTag(type)] })(type),
            getAllUsers: ({ next }) =>
              cache(next, ["oberon-get-all-users"], {
                tags: ["oberon-users"],
              }),
            getAllImages: ({ next }) =>
              cache(next, ["oberon-get-all-images"], {
                tags: ["oberon-images"],
              }),
            getSite: ({ next }) =>
              cache(next, ["oberon-get-site"], {
                tags: ["oberon-config"],
              }),
          }
        : {},
  }
}
