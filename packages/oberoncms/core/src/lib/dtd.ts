import { z } from "zod"
import { Data } from "@measured/puck"
import { Route } from "next"
import type {
  ComponentConfig,
  Config,
  DefaultComponentProps,
} from "@measured/puck"
import type { AdapterUser, Adapter as AuthAdapter } from "@auth/core/adapters"
import type { StreamResponseChunk } from "@tohuhono/utils"
import type { NextAuthResult } from "next-auth"
import type { Awaitable } from "@auth/core/types"

export class OberonError extends Error {}

export class ResponseError extends Error {}

// TODO fix types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Transforms = Array<(props: any) => any>

export type PageData = Data

export type OberonConfig = Config & {
  version: 1
  components: Record<
    string,
    {
      transforms?: Transforms
    }
  >
}

export type OberonComponent<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  Transforms extends Array<
    (props: Record<string, unknown>) => Record<string, unknown>
  > = Array<(props: Record<string, unknown>) => Record<string, unknown>>,
> = ComponentConfig<ComponentProps> & {
  transforms?: Transforms
}

export const clientActions = [
  "edit",
  "preview",
  "users",
  "images",
  "pages",
  "site",
  "login",
] as const
export const actionPaths = clientActions.map((action) => ({
  path: [action],
}))
export type ClientAction = (typeof clientActions)[number]

export type AdapterActionGroup = "all" | "users" | "images" | "pages" | "site"
export type AdapterPermission = "unauthenticated" | "read" | "write"
export type OberonRole = "user" | "admin"

export type OberonPermissions = Record<
  "unauthenticated" | "user",
  Partial<Record<AdapterActionGroup, AdapterPermission>>
>

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
  data: z.object({}).passthrough(),
  updatedAt: z.date(),
  updatedBy: z.string(),
})

export const AddPageSchema = PageSchema.pick({ key: true })

export const DeletePageSchema = PageSchema.pick({ key: true })

export const PublishPageSchema = PageSchema.pick({ key: true, data: true })

export const PageMetaSchema = PageSchema.pick({
  key: true,
  updatedAt: true,
  updatedBy: true,
})

export type OberonPage = z.infer<typeof PageSchema> & {
  data: PageData
  key: Route
}

// Cannot infer from zod because we need nextjs to understand key is a valid Route
export type OberonPageMeta = MaybeOptimistic<
  z.infer<typeof PageMetaSchema> & {
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

export const roles: OberonRole[] = ["user", "admin"] as const

/*
 * Context
 */

type DescriminatedContext =
  | { action: "edit" | "preview"; data: Data | null }
  | { action: "users"; data: OberonUser[] }
  | { action: "images"; data: OberonImage[] }
  | { action: "pages"; data: OberonPageMeta[] }
  | { action: "site"; data: OberonSiteConfig }
  | {
      action: "login"
      data: { callbackUrl: string; email: string; token: string }
    }

export type OberonClientContext = DescriminatedContext & {
  slug: string
}

/*
 * Site
 */
type TransformStatus = "error" | "success"

export type TransformResult = {
  type: "transform"
  key: string
  status: "success" | "error"
}

export type MigrationResult = {
  type: "summary"
  total: number
} & {
  [key in TransformStatus]: string[]
}

export type TransformVersions = Record<string, number>

export type OberonSiteConfig = MaybeOptimistic<{
  version: string
  plugins: Array<
    Pick<ReturnType<OberonPlugin>, "name" | "version" | "disabled">
  >
  components: TransformVersions
  pendingMigrations: string[] | false
}>

export const SiteSchema = z.object({
  version: z.number(),
  components: z.record(z.string(), z.number()),
  updatedAt: z.date(),
  updatedBy: z.string(),
})

export type OberonSite = z.infer<typeof SiteSchema>

/*
 * Adapter
 */

// Currently the only handles exported are NextAuth Handlers
type OberonRouteHandler = NextAuthResult["handlers"]

export type OberonAdapterMeta = {
  plugins: Array<{ name: string; version: string; disabled?: boolean }>
  handlers: Record<string, OberonRouteHandler>
}

export type OberonInitAdapter = {
  prebuild: () => Promise<void>
}

export type OberonCanAdapter = {
  getCurrentUser: () => Promise<OberonUser | null>
  hasPermission: (props: {
    user?: OberonUser | null
    action: AdapterActionGroup
    permission: AdapterPermission
  }) => boolean
  signIn: (data: { email: string }) => Promise<void>
  signOut: () => Promise<void>
}

export type OberonAuthAdapter = Required<
  Pick<
    AuthAdapter,
    | "createSession"
    | "createUser"
    | "createVerificationToken"
    | "deleteSession"
    | "deleteUser"
    | "getSessionAndUser"
    | "getUser"
    | "getUserByAccount"
    | "getUserByEmail"
    | "linkAccount"
    | "unlinkAccount"
    | "updateSession"
    | "updateUser"
    | "useVerificationToken"
  >
> & {
  createUser(
    user: Omit<AdapterUser & { role: OberonRole }, "id">,
  ): Awaitable<AdapterUser & { role: OberonRole }>
  deleteUser: (id: OberonUser["id"]) => Promise<void>
}

export type OberonDatabaseAdapter = {
  addPage: (page: OberonPage) => Promise<void>
  addImage: (data: z.infer<typeof ImageSchema>) => Promise<void>
  addUser: (data: z.infer<typeof AddUserSchema>) => Promise<OberonUser>
  deletePage: (key: OberonPageMeta["key"]) => Promise<void>
  deleteImage: (key: OberonImage["key"]) => Promise<void> // TODO uploadthing
  deleteUser: (id: OberonUser["id"]) => Promise<void>
  changeRole: (data: z.infer<typeof ChangeRoleSchema>) => Promise<void>
  getAllImages: () => Promise<OberonImage[]>
  getAllPages: () => Promise<OberonPageMeta[]>
  getAllUsers: () => Promise<OberonUser[]>
  getPageData: (key: OberonPageMeta["key"]) => Promise<Data | null>
  getSite: () => Promise<OberonSite | undefined>
  updatePageData: (data: OberonPage) => Promise<void>
  updateSite: (data: z.infer<typeof SiteSchema>) => Promise<void>
}

export type OberonSendAdapter = {
  sendVerificationRequest: (props: {
    email: string
    token: string
    url: string
  }) => Promise<void>
}

export type OberonPluginAdapter = OberonInitAdapter &
  OberonCanAdapter &
  OberonDatabaseAdapter &
  OberonAuthAdapter &
  OberonSendAdapter

export type OberonAdapter = OberonAdapterMeta & OberonPluginAdapter

export type OberonPlugin = (adapter: OberonAdapter) => {
  name: string
  version?: string
  disabled?: boolean
  handlers?: Record<string, OberonRouteHandler>
  adapter?: Partial<OberonPluginAdapter>
}

export type OberonActions = {
  addPage: (page: z.infer<typeof AddPageSchema>) => Promise<void>
  addImage: (data: OberonImage) => Promise<OberonImage[]>
  addUser: (data: z.infer<typeof AddUserSchema>) => Promise<OberonUser | null>
  deletePage: (data: z.infer<typeof DeletePageSchema>) => Promise<void>
  deleteImage: (key: OberonImage["key"]) => Promise<void> // TODO uploadthing
  deleteUser: (
    data: z.infer<typeof DeleteUserSchema>,
  ) => Promise<Pick<OberonUser, "id"> | null>
  can: (
    action: AdapterActionGroup,
    permission?: AdapterPermission,
  ) => Promise<boolean>
  changeRole: (
    data: z.infer<typeof ChangeRoleSchema>,
  ) => Promise<Pick<OberonUser, "role" | "id"> | null>
  getAllImages: () => Promise<OberonImage[]>
  getAllPages: () => Promise<OberonPageMeta[]>
  getAllPaths: () => Promise<Array<{ path: string[] }>>
  getAllUsers: () => Promise<OberonUser[]>
  getConfig: () => Promise<OberonSiteConfig>
  getPageData: (key: OberonPageMeta["key"]) => Promise<Data | null>
  migrateData: () => Promise<
    StreamResponseChunk<TransformResult | MigrationResult>
  >
  publishPageData: (data: z.infer<typeof PublishPageSchema>) => Promise<void>
  signOut: () => Promise<void>
  signIn: (data: { email: string }) => Promise<void>
}

export type OberonResponse<T = unknown> = Promise<
  | {
      status: "success"
      result: T
      message?: string
    }
  | {
      status: "error"
      result?: T
      message?: string
    }
>

export type OberonServerActions = {
  addPage: (page: z.infer<typeof AddPageSchema>) => OberonResponse<void>
  addImage: (data: OberonImage) => OberonResponse<OberonImage[]>
  addUser: (
    data: z.infer<typeof AddUserSchema>,
  ) => OberonResponse<OberonUser | null>
  deletePage: (data: z.infer<typeof DeletePageSchema>) => OberonResponse
  deleteImage: (key: OberonImage["key"]) => OberonResponse
  deleteUser: (
    data: z.infer<typeof DeleteUserSchema>,
  ) => OberonResponse<Pick<OberonUser, "id"> | null>
  can: (
    action: AdapterActionGroup,
    permission?: AdapterPermission,
  ) => OberonResponse<boolean>
  changeRole: (
    data: z.infer<typeof ChangeRoleSchema>,
  ) => OberonResponse<Pick<OberonUser, "role" | "id"> | null>
  getAllImages: () => OberonResponse<OberonImage[]>
  getAllPages: () => OberonResponse<OberonPageMeta[]>
  getAllPaths: () => OberonResponse<Array<{ path: string[] }>>
  getAllUsers: () => OberonResponse<OberonUser[]>
  getConfig: () => OberonResponse<OberonSiteConfig>
  getPageData: (key: OberonPageMeta["key"]) => OberonResponse<Data | null>
  migrateData: () => OberonResponse<
    StreamResponseChunk<TransformResult | MigrationResult>
  >
  publishPageData: (data: z.infer<typeof PublishPageSchema>) => OberonResponse
  signIn: (data: { email: string }) => OberonResponse
  signOut: () => OberonResponse
}
