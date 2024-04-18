import { z } from "zod"
import { Data } from "@measured/puck"
import { Route } from "next"
import type { Config } from "@measured/puck"
import type { NextAuthResult } from "next-auth"

export type OberonConfig = {
  blocks: Config["components"]
  resolvePath: (path?: string[]) => string
}

export type ClientAction = "edit" | "preview" | "users" | "images" | "pages"

export const INITIAL_DATA = {
  content: [],
  root: { props: { title: "" } },
} satisfies Data

/*
 * Images
 */

export const ImageSchema = z.object({
  key: z.string(),
  url: z.string(),
  size: z.number(),
  width: z.number().gt(0),
  height: z.number().gt(0),
  alt: z.string(),
})

export const DeleteImageSchema = ImageSchema.pick({ key: true })

export type OberonImage = z.infer<typeof ImageSchema>

/*
 * Users
 */

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
})

export const AddUserSchema = UserSchema.pick({ email: true, role: true })
export const ChangeRoleSchema = UserSchema.pick({ id: true, role: true })
export const DeleteUserSchema = UserSchema.pick({ id: true })

export type User = z.infer<typeof UserSchema>

export const roles = ["user", "admin"] as const

/*
 * Actions
 */

export type ServerActions = {
  addUser: (data: z.infer<typeof AddUserSchema>) => Promise<User | null>
  deleteUser: (
    data: z.infer<typeof DeleteUserSchema>,
  ) => Promise<Pick<User, "id"> | null>
  changeRole: (
    data: z.infer<typeof ChangeRoleSchema>,
  ) => Promise<Pick<User, "role" | "id"> | null>
  getAllUsers: () => Promise<User[]>
  getAllImages: () => Promise<OberonImage[]>
  addImage: (image: OberonImage) => Promise<OberonImage[]>
  deleteImage: (key: unknown) => Promise<void> // TODO uploadthing
  addPage: (key: string) => Promise<void>
  deletePage: (key: string) => Promise<void>
  publishPageData: (props: { key: string; data: Data }) => Promise<void>
  getPageData: (url: string) => Promise<Data | null>
  getAllKeys: () => Promise<Route[]>
  getAllPaths: () => Promise<Array<{ puckPath: string[] }>>
}

export type OberonAdapter = {
  auth: NextAuthResult["auth"]
  actions: ServerActions
}
