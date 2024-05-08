import { z } from "zod"
import { Data } from "@measured/puck"
import { Route } from "next"
import type { Config } from "@measured/puck"
import type { Adapter as AuthAdapter } from "@auth/core/adapters"

export type OberonConfig = {
  blocks: Config["components"]
}

export type ClientAction = "edit" | "preview" | "users" | "images" | "pages"
export type AdapterActionGroup = "cms" | "users" | "images" | "pages"
export type AdapterPermission = "read" | "write"

export const INITIAL_DATA = {
  content: [],
  root: { props: { title: "" } },
} satisfies Data

export type MaybeOptimistic<T> = T & {
  pending?: boolean
}

/*
 * Pages
 */
export const PageSchema = z.object({
  key: z
    .string()
    .regex(/^[0-9a-zA-Z_.-/]+$/, "Valid characters: 0-9 a-z A-Z -_./")
    .regex(/^(\/|\/[^/]+(\/[^/]+)*)$/, "Route segments cannot be empty"),
})

export const DeletePageSchema = PageSchema.pick({ key: true })

export const PublishPageSchema = PageSchema.pick({ key: true }).extend({
  data: z.any(),
})

// Cannot infer from zod because we need nextjs to understand key is a valid Route
export type OberonPage = MaybeOptimistic<
  z.infer<typeof PageSchema> & {
    key: Route
  }
>

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
  updatedAt: z.date(),
  updatedBy: z.string(),
})

export const AddImageSchema = ImageSchema

export const DeleteImageSchema = ImageSchema.pick({ key: true })

export type OberonImage = MaybeOptimistic<z.infer<typeof ImageSchema>>

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

export type OberonUser = MaybeOptimistic<z.infer<typeof UserSchema>>

export const roles = ["user", "admin"] as const

/*
 * Context
 */

type DescriminatedContext =
  | { action: "edit" | "preview"; data: Data | null }
  | { action: "users"; data: OberonUser[] }
  | { action: "images"; data: OberonImage[] }
  | { action: "pages"; data: OberonPage[] }

export type OberonClientContext = DescriminatedContext & {
  slug: string
}

/*
 * Adapter
 */

export type OberonDatabaseAdapter = {
  addUser: (data: z.infer<typeof AddUserSchema>) => Promise<OberonUser>
  deleteUser: (
    id: OberonUser["id"],
  ) => Promise<Pick<OberonUser, "id"> | undefined>
  changeRole: (data: z.infer<typeof ChangeRoleSchema>) => Promise<void>
  getAllUsers: () => Promise<OberonUser[]>
  getAllImages: () => Promise<OberonImage[]>
  addImage: (data: z.infer<typeof ImageSchema>) => Promise<void>
  deleteImage: (key: OberonImage["key"]) => Promise<void> // TODO uploadthing
  addPage: (page: OberonPage & { data: string }) => Promise<void>
  deletePage: (key: OberonPage["key"]) => Promise<void>
  getAllPages: () => Promise<OberonPage[]>
  publishPageData: (data: z.infer<typeof PublishPageSchema>) => Promise<void>
  getPageData: (key: OberonPage["key"]) => Promise<string | null>
} & AuthAdapter

export type OberonActions = {
  addUser: (data: z.infer<typeof AddUserSchema>) => Promise<OberonUser | null>
  deleteUser: (
    data: z.infer<typeof DeleteUserSchema>,
  ) => Promise<Pick<OberonUser, "id"> | null>
  changeRole: (
    data: z.infer<typeof ChangeRoleSchema>,
  ) => Promise<Pick<OberonUser, "role" | "id"> | null>
  getAllUsers: () => Promise<OberonUser[]>
  getAllImages: () => Promise<OberonImage[]>
  addImage: (data: z.infer<typeof AddImageSchema>) => Promise<OberonImage[]>
  deleteImage: (key: OberonImage["key"]) => Promise<void> // TODO uploadthing
  addPage: (page: OberonPage) => Promise<void>
  deletePage: (data: z.infer<typeof DeletePageSchema>) => Promise<void>
  getAllPages: () => Promise<OberonPage[]>
  publishPageData: (data: z.infer<typeof PublishPageSchema>) => Promise<void>
  getPageData: (key: OberonPage["key"]) => Promise<Data | null>
  getAllPaths: () => Promise<Array<{ puckPath: string[] }>>
  can: (
    action: AdapterActionGroup,
    permission?: AdapterPermission,
  ) => Promise<boolean>
}

export type OberonAdapter = OberonActions

export type OberonPlugin = (
  adapter: OberonDatabaseAdapter,
) => OberonDatabaseAdapter
