import { z } from "zod"
import { Data } from "@measured/puck"
import { Route } from "next"
import type { Config } from "@measured/puck"

/*
 * Pages
 */

/*
 * Assets
 */

export const AssetSchema = z.object({
  key: z.string(),
  url: z.string().url(),
  size: z.number(),
  name: z.string(),
})

export const DeleteAssetSchema = AssetSchema.pick({ key: true })

export type Asset = z.infer<typeof AssetSchema>

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

export type ClientPageProps = {
  params: { framework: string; uuid: string; puckPath: string[] }
}

export const primitives = ["div", "p", "h1", "h2", "h3", "ul", "li"] as const
export type Primitive = (typeof primitives)[number]

export type Actions = {
  addUser: (data: z.infer<typeof AddUserSchema>) => Promise<User | null>
  deleteUser: (
    data: z.infer<typeof DeleteUserSchema>,
  ) => Promise<Pick<User, "id"> | null>
  changeRole: (
    data: z.infer<typeof ChangeRoleSchema>,
  ) => Promise<Pick<User, "role" | "id"> | null>
  getAllUsers: () => Promise<User[]>
  getAllAssets: () => Promise<Asset[]>
  deleteAsset: (key: unknown) => Promise<void> // TODO uploadthing
  deletePage: (key: string) => Promise<void>
  publishPageData: (props: { key: string; data: Data }) => Promise<void>
  getPageData: (url: string) => Promise<Data | null>
  getAllKeys: () => Promise<Route[]>
  getAllPaths: () => Promise<Array<{ puckPath: string[] }>>
  resolvePath: (slug?: string[]) => string
}

export type OberonConfig = {
  // TODO: fix any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: Config["components"]
  actions?: Actions
}
