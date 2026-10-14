import { type OberonPlugin } from "@oberoncms/core"
import { redirect, notFound } from "@tanstack/react-router"
import { getRequest } from "@tanstack/react-start/server"
import { tanstackStartCookies } from "better-auth/tanstack-start"

import { name, version } from "../package.json" with { type: "json" }

export { createRestHandler } from "./handler"

export const plugin: OberonPlugin = ({ phase }) => ({
  name,
  version,
  adapter:
    phase === "runtime"
      ? {
          redirect:
            () =>
            ({ href }) => {
              throw redirect({ to: href })
            },
          notFound: () => () => {
            throw notFound()
          },
          getRequestHeaders: () => async () => getRequest().headers,
          getAuthPlugins:
            ({ next }) =>
            () => [...next(), tanstackStartCookies()],
        }
      : {},
})
