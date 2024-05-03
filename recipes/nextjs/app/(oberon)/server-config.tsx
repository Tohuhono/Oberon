import "server-only"

import { databaseAdapter } from "@oberoncms/adapter-turso"
import type { OberonServerActions } from "@oberoncms/core"
import { initAdapter } from "@oberoncms/core/adapter"
import { initAuth } from "@oberoncms/core/auth"
import { Resend } from "resend"

const emailFrom = process.env.EMAIL_FROM || "noreply@tohuhono.com"

const sendVerificationRequest = async ({
  email,
  token,
  url,
}: {
  email: string
  token: string
  url: string
}) => {
  if (!process.env.RESEND_SECRET) {
    throw new Error("No RESEND_SECRET configured")
  }
  const resend = new Resend(process.env.RESEND_SECRET)

  try {
    const response = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "One time login to Oberon CMS",
      text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
    })

    if (response.error || !response.data?.id) {
      console.error("Resend response error", response.error)
      return
    }

    console.log(`Sent email id ${response.data.id}`)
  } catch (error) {
    console.error("Signin email failed to send")
  }
}

export const { handlers, getRole } = initAuth({
  adapter: databaseAdapter,
  sendVerificationRequest,
})

export const adapter = initAdapter({ db: databaseAdapter, getRole })

export const actions = {
  getAllPaths: async () => {
    "use server"
    return adapter.getAllPaths()
  },
  getAllPages: async () => {
    "use server"
    return adapter.getAllPages()
  },
  getPageData: async (key) => {
    "use server"
    return adapter.getPageData(key)
  },
  addPage: async (data) => {
    "use server"
    return adapter.addPage(data)
  },
  deletePage: async (data) => {
    "use server"
    return adapter.deletePage(data)
  },
  publishPageData: async (data) => {
    "use server"
    return adapter.publishPageData(data)
  },
  getAllImages: async () => {
    "use server"
    return adapter.getAllImages()
  },
  addImage: async (data) => {
    "use server"
    return adapter.addImage(data)
  },
  deleteImage: async (key) => {
    "use server"
    return adapter.deleteImage(key)
  },
  getAllUsers: async () => {
    "use server"
    return adapter.getAllUsers()
  },
  addUser: async (data) => {
    "use server"
    return adapter.addUser(data)
  },
  deleteUser: async (data) => {
    "use server"
    return adapter.deleteUser(data)
  },
  changeRole: async (data) => {
    "use server"
    return adapter.changeRole(data)
  },
  can: async (action, permission) => {
    "use server"
    return adapter.can(action, permission)
  },
} satisfies OberonServerActions
