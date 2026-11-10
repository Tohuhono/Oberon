import type {
  ComponentConfig,
  Config,
  Data,
  DefaultComponentProps,
  DefaultComponents,
  SlotComponent,
} from "@puckeditor/core"
import type { ImageTransform } from "@tohuhono/ui/image"
import type { StreamResponseChunk } from "@tohuhono/utils"
import type { BetterAuthOptions } from "better-auth/minimal"
import type { ComponentType, ReactNode } from "react"
import { z } from "zod"

// Compatible with Nextjs
type OberonRoute = string & {}

export class OberonError extends Error {}

export class ResponseError extends Error {}

export class FragmentRevisionError extends ResponseError {}

export class NotImplementedError extends ResponseError {}

// TODO fix types
// oxlint-disable-next-line @typescript/no-explicit-any
type Transforms = Array<(props: any) => any>

export type FragmentData = Data<DefaultComponents, DefaultComponentProps>

export type OberonClientConfig<Components extends DefaultComponents = DefaultComponents> = Config<{
  components: Components
}> & {
  version: 1
  components: Record<
    string,
    {
      transforms?: Transforms
    }
  >
  authoring?: {
    Editor?: ComponentType<{ path: string; data: FragmentData | null; config: OberonClientConfig }>
    Preview?: ComponentType<{ path: string; data: FragmentData | null; config: OberonClientConfig }>
    Library?: ComponentType<{ config: OberonClientConfig }>
    label?: string
  }
}

export type OberonConfig = {
  client: OberonClientConfig
  plugins: OberonPlugin[]
}

export function defineConfig(config: OberonConfig): OberonConfig {
  return config
}

export type OberonComponent<Props extends DefaultComponentProps = DefaultComponentProps> =
  ComponentConfig<{
    props: Props
  }>

type OberonFieldMap = Record<string, { type: string }>

type InferOberonFieldProp<FieldConfig> = FieldConfig extends { type: "slot" }
  ? SlotComponent
  : FieldConfig extends { type: "richtext" }
    ? ReactNode
    : FieldConfig extends { type: "textarea"; contentEditable: true }
      ? ReactNode
      : FieldConfig extends { type: "text" | "textarea" }
        ? string
        : FieldConfig extends { type: "number" }
          ? number
          : unknown

type InferOberonRequiredFieldKeys<FieldMap extends OberonFieldMap> = {
  [Key in keyof FieldMap]: FieldMap[Key] extends { type: "slot" } ? Key : never
}[keyof FieldMap]

type InferOberonOptionalFieldKeys<FieldMap extends OberonFieldMap> = Exclude<
  keyof FieldMap,
  InferOberonRequiredFieldKeys<FieldMap>
>

type InferOberonFieldProps<FieldMap extends OberonFieldMap> = {
  [Key in InferOberonRequiredFieldKeys<FieldMap>]: InferOberonFieldProp<FieldMap[Key]>
} & {
  [Key in InferOberonOptionalFieldKeys<FieldMap>]?: InferOberonFieldProp<FieldMap[Key]>
}

type DefineOberonComponentConfig<
  Props extends DefaultComponentProps,
  FieldMap extends OberonFieldMap,
> = Omit<OberonComponent<Props>, "fields"> & {
  fields?: FieldMap & NonNullable<OberonComponent<Props>["fields"]>
}

export function defineOberonComponent<const FieldMap extends OberonFieldMap>(
  config: DefineOberonComponentConfig<InferOberonFieldProps<FieldMap>, FieldMap>,
): OberonComponent<InferOberonFieldProps<FieldMap>>

export function defineOberonComponent<
  Props extends DefaultComponentProps,
  const FieldMap extends OberonFieldMap = {},
>(config: DefineOberonComponentConfig<Props, FieldMap>): OberonComponent<Props>

export function defineOberonComponent(
  config: DefineOberonComponentConfig<DefaultComponentProps, OberonFieldMap>,
): OberonComponent<DefaultComponentProps> {
  return config
}

export const clientActions = [
  "edit",
  "preview",
  "users",
  "images",
  "pages",
  "site",
  "login",
  "library",
] as const
export const actionPaths = clientActions.map((action) => ({
  path: [action],
}))
export type ClientAction = (typeof clientActions)[number]

export type AdapterActionGroup = "all" | "users" | "images" | "pages" | "site"
export type AdapterPermission = "unauthenticated" | "read" | "write"
export type OberonRole = "user" | "admin" | "unauthenticated" | (string & {})

export const CanSchema = z.object({
  action: z.enum(["all", "users", "images", "pages", "site"]),
  permission: z.enum(["unauthenticated", "read", "write"]).optional(),
})

export type OberonPermissions = Record<
  OberonRole,
  Partial<Record<AdapterActionGroup, AdapterPermission>>
>

export const INITIAL_DATA = {
  content: [],
  root: { props: { title: "" } },
} satisfies Data

export type MaybeOptimistic<T> = T & {
  pending?: boolean
}

export const JsonValueSchema = z.json()

export type JsonValue = z.infer<typeof JsonValueSchema>

/*
 * Fragments
 */
export const PagePathSchema = z
  .string()
  .regex(/^[0-9a-zA-Z_.-/]+$/, "Valid characters: 0-9 a-z A-Z -_./")
  .regex(/^(\/|\/[^/]+(\/[^/]+)*)$/, "Route segments cannot be empty")

const ComponentDataSchema = z.looseObject({
  type: z.string().min(1),
  props: z.looseObject({ id: z.string().min(1) }),
})

export const FragmentDataSchema = z
  .looseObject({
    root: z.looseObject({ props: z.record(z.string(), JsonValueSchema).optional() }),
    content: z.array(ComponentDataSchema),
    zones: z.record(z.string(), z.array(ComponentDataSchema)).optional(),
  })
  .refine((data) => JsonValueSchema.safeParse(data).success, "Fragment data must be JSON")

export const FragmentSchema = z.object({
  key: z.string().min(1).max(512),
  type: z.string().regex(/^[a-z][a-z0-9-]*$/, "Use a lowercase Fragment type"),
  data: FragmentDataSchema,
  updatedAt: z.date(),
  updatedBy: z.string(),
})

function validatePagePath(fragment: { key: string; type: string }, context: z.RefinementCtx) {
  if (fragment.type !== "page") return

  const parsed = PagePathSchema.safeParse(fragment.key)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      context.addIssue({ code: "custom", path: ["key"], message: issue.message })
    }
  }
}

export const AddFragmentSchema = FragmentSchema.pick({ key: true, type: true }).superRefine(
  validatePagePath,
)

export const DeleteFragmentSchema = FragmentSchema.pick({ key: true, type: true })
  .extend({ expectedUpdatedAt: z.coerce.date().optional() })
  .superRefine(validatePagePath)

export const GetFragmentDataSchema = FragmentSchema.pick({ key: true }).extend({
  type: FragmentSchema.shape.type.optional(),
})

export const PublishFragmentSchema = FragmentSchema.pick({ key: true, type: true, data: true })
  .extend({ expectedUpdatedAt: z.coerce.date().optional() })
  .superRefine(validatePagePath)

export const FragmentMetaSchema = FragmentSchema.pick({
  key: true,
  type: true,
  updatedAt: true,
  updatedBy: true,
})

export type OberonFragment = z.infer<typeof FragmentSchema> & {
  data: FragmentData
  key: OberonRoute
}

// Cannot infer from zod because we need nextjs to understand key is a valid Route
export type OberonFragmentMeta = MaybeOptimistic<
  z.infer<typeof FragmentMetaSchema> & {
    key: OberonRoute
  }
>

export const FRAGMENT_REVISION = { namespace: "oberon-fragments", key: "revision" } as const

export type FragmentWriteOptions = {
  expectedUpdatedAt?: Date
  expectedRevision?: string
}

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
  email: z.email(),
  role: z.union([z.literal("user"), z.literal("admin"), z.string()]),
})

export const AddUserSchema = UserSchema.pick({ email: true, role: true })
export const ChangeRoleSchema = UserSchema.pick({ id: true, role: true })
export const DeleteUserSchema = UserSchema.pick({ id: true })

export type OberonUser = MaybeOptimistic<z.infer<typeof UserSchema>> & {
  role: "user" | "admin" | (string & {})
}

export const roles: OberonRole[] = ["user", "admin"] as const

export const SignInSchema = z.object({ email: z.email() })

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

export type PluginVersion = Pick<ReturnType<OberonPlugin>, "name" | "version" | "disabled">

export type OberonSiteConfig = MaybeOptimistic<{
  version: string
  plugins: PluginVersion[]
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

export type OberonRoutingAdapter = {
  redirect: (data: { href: string }) => never
  notFound: () => never
  getRequestHeaders: () => Promise<Headers>
}

export type OberonAuthAdapter = {
  getAuthDatabase: () => BetterAuthOptions["database"]
  getAuthPlugins: () => NonNullable<BetterAuthOptions["plugins"]>
}

export type OberonDatabaseAdapter = {
  addFragment: (fragment: OberonFragment & FragmentWriteOptions) => Promise<void>
  addImage: (data: z.infer<typeof ImageSchema>) => Promise<void>
  deleteFragment: (
    data: z.infer<typeof DeleteFragmentSchema> & FragmentWriteOptions,
  ) => Promise<void>
  deleteImage: (data: z.infer<typeof DeleteImageSchema>) => Promise<void> // TODO uploadthing
  deleteKV: (data: { namespace: string; key: string }) => Promise<void>
  getAllImages: () => Promise<OberonImage[]>
  getAllFragments: (data: z.infer<typeof GetAllFragmentsSchema>) => Promise<OberonFragmentMeta[]>
  getFragmentData: (data: z.infer<typeof GetFragmentDataSchema>) => Promise<FragmentData | null>
  getFragmentRevision: () => Promise<string>
  getKV: (data: { namespace: string; key: string }) => Promise<JsonValue | null>
  getSite: () => Promise<OberonSite | undefined>
  putKV: (data: { namespace: string; key: string; value: JsonValue }) => Promise<void>
  updateFragmentData: (data: OberonFragment & FragmentWriteOptions) => Promise<void>
  updateSite: (data: z.infer<typeof SiteSchema>) => Promise<void>
  addUser: (data: z.infer<typeof AddUserSchema>) => Promise<OberonUser>
  deleteUser: (data: z.infer<typeof DeleteUserSchema>) => Promise<void>
  changeRole: (data: z.infer<typeof ChangeRoleSchema>) => Promise<void>
  getAllUsers: () => Promise<OberonUser[]>
}

export type OberonSendAdapter = {
  sendVerificationRequest: (props: { email: string; token: string; url: string }) => Promise<void>
}

export type OberonPluginAdapter = OberonDatabaseAdapter &
  OberonCanAdapter &
  OberonSendAdapter &
  OberonAuthAdapter &
  OberonRoutingAdapter & {
    getContentClasses: (content: { fragments: FragmentData[] }) => Promise<string[]>
    prepareContent: (content: { config: Config; data: FragmentData }) => Promise<{
      config: Config
      data: FragmentData
    }>
    contentChanged: () => Promise<void>
  }

export type OberonMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type OberonHandler = {
  [key in OberonMethod]?: (req: Request) => Promise<Response> | Response
}

export type OberonAdapter = OberonPluginAdapter & {
  can: (data: z.infer<typeof CanSchema>) => Promise<boolean>
  handleRequest: (
    request: Request,
    context: { method: OberonMethod; path?: string[] | string },
  ) => Promise<Response>
  will: (data: { action: AdapterActionGroup; permission: AdapterPermission }) => Promise<void>
  whoWill: (data: {
    action: AdapterActionGroup
    permission: AdapterPermission
  }) => Promise<OberonUser>
  getAllPaths: () => Promise<Array<{ path: string[] }>>
  getConfig: () => Promise<OberonSiteConfig>
  migrateData: (user: OberonUser) => Promise<StreamResponseChunk<TransformResult | MigrationResult>>
}

export type OberonPluginPhase = "bootstrap" | "runtime"

export type OberonPluginAdapterHook<Key extends keyof OberonPluginAdapter> = (context: {
  getAdapter: () => Omit<OberonAdapter, Key>
  next: OberonPluginAdapter[Key]
}) => OberonPluginAdapter[Key]

export type OberonPluginAdapterHooks = {
  [Key in keyof OberonPluginAdapter]?: OberonPluginAdapterHook<Key>
}

export type OberonPlugin = (context: {
  getAdapter: () => OberonAdapter
  phase: OberonPluginPhase
}) => {
  name: string
  version?: string
  disabled?: boolean
  handlers?: Record<string, (adapter: OberonAdapter) => OberonHandler>
  adapter?: OberonPluginAdapterHooks
  bootstrap?: () => Promise<void>
}

export type OberonResponse<T = unknown> = Promise<
  | {
      status: "success"
      result: T
      message?: string
    }
  | {
      status: "error"
      message: string
    }
>

export const GetAllImagesSchema = z.undefined()
export const GetAllFragmentsSchema = z.object({ type: FragmentSchema.shape.type.optional() })
export const GetAllPathsSchema = z.undefined()
export const GetAllUsersSchema = z.undefined()
export const GetConfigSchema = z.undefined()
export const MigrateDataSchema = z.undefined()
export const SignOutSchema = z.undefined()

export const ResolvePathSchema = z.object({ key: z.string() })

export type OberonServerActions = {
  resolvePath: (
    data: z.infer<typeof ResolvePathSchema>,
  ) => Promise<{ key: string; data: FragmentData }>
  addFragment: (page: z.infer<typeof AddFragmentSchema>) => OberonResponse<void>
  addImage: (data: OberonImage) => OberonResponse<OberonImage[]>
  addUser: (data: z.infer<typeof AddUserSchema>) => OberonResponse<OberonUser | null>
  deleteFragment: (data: z.infer<typeof DeleteFragmentSchema>) => OberonResponse<void>
  deleteImage: (data: z.infer<typeof DeleteImageSchema>) => OberonResponse<void>
  deleteUser: (
    data: z.infer<typeof DeleteUserSchema>,
  ) => OberonResponse<Pick<OberonUser, "id"> | null>
  can: (data: z.infer<typeof CanSchema>) => OberonResponse<boolean>
  changeRole: (
    data: z.infer<typeof ChangeRoleSchema>,
  ) => OberonResponse<Pick<OberonUser, "role" | "id"> | null>
  getAllImages: (data?: z.infer<typeof GetAllImagesSchema>) => OberonResponse<OberonImage[]>
  getAllFragments: (
    data: z.infer<typeof GetAllFragmentsSchema>,
  ) => OberonResponse<OberonFragmentMeta[]>
  getAllPaths: (
    data?: z.infer<typeof GetAllPathsSchema>,
  ) => OberonResponse<Array<{ path: string[] }>>
  getAllUsers: (data?: z.infer<typeof GetAllUsersSchema>) => OberonResponse<OberonUser[]>
  getConfig: (data?: z.infer<typeof GetConfigSchema>) => OberonResponse<OberonSiteConfig>
  getFragmentData: (
    data: z.infer<typeof GetFragmentDataSchema>,
  ) => OberonResponse<FragmentData | null>
  migrateData: (
    data?: z.infer<typeof MigrateDataSchema>,
  ) => OberonResponse<StreamResponseChunk<TransformResult | MigrationResult>>
  publishFragmentData: (
    data: z.infer<typeof PublishFragmentSchema>,
  ) => OberonResponse<{ key: string }>
  signIn: (data: z.infer<typeof SignInSchema>) => OberonResponse<void>
  signOut: (data?: z.infer<typeof SignOutSchema>) => OberonResponse<void>
}

/*
 * Context
 */

type DescriminatedContext =
  | { action: "edit" | "preview"; data: FragmentData | null }
  | { action: "users"; data: OberonUser[] }
  | { action: "images"; data: OberonImage[] }
  | { action: "pages"; data: OberonFragmentMeta[] }
  | { action: "site"; data: OberonSiteConfig }
  | { action: "library"; data: null }
  | {
      action: "login"
      data: { callbackUrl: string; email: string; token: string }
    }

export type OberonClientContext = DescriminatedContext & {
  slug: string
}

const OberonQueryParamValueSchema = z
  .union([z.string(), z.number(), z.boolean()])
  .transform((value) => String(value))

export const OberonQueryParamsSchema = z.record(
  z.string(),
  z.union([OberonQueryParamValueSchema, z.array(OberonQueryParamValueSchema), z.undefined()]),
)

export type OberonQueryParams = z.infer<typeof OberonQueryParamsSchema>

export const OberonClientContextRequestSchema = z.object({
  path: z.array(z.string()),
  searchParams: OberonQueryParamsSchema,
})

export type OberonClientContextRequest = z.infer<typeof OberonClientContextRequestSchema>

export type OberonImageTransform = ImageTransform

export type OberonNavigation = {
  navigate: (href: string) => void
  notFound: () => never
  refresh: () => void
}

type UnwrappedResult<TResponse> =
  TResponse extends OberonResponse<infer TResult> ? TResult : Awaited<TResponse>

export type OberonClientActions = {
  [Key in keyof OberonServerActions]: (
    ...props: Parameters<OberonServerActions[Key]>
  ) => Promise<UnwrappedResult<ReturnType<OberonServerActions[Key]>>>
}

export type OberonContext = {
  actions: OberonClientActions
  context: OberonClientContext
  navigation: OberonNavigation
}
