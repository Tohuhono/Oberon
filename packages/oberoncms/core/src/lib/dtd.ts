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
import type { ReactNode } from "react"
import { z } from "zod"

// Compatible with Nextjs
type OberonRoute = string & {}

export class OberonError extends Error {}

export class ResponseError extends Error {}

export class NotImplementedError extends ResponseError {}

// TODO fix types
// oxlint-disable-next-line @typescript/no-explicit-any
type Transforms = Array<(props: any) => any>

export type PageData = Data

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
  "library",
  "site",
  "login",
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
 * Components
 */
const PuckNodeSchema = z.looseObject({
  type: z.string().min(1),
  props: z.looseObject({ id: z.string().optional() }),
  readOnly: z.record(z.string(), z.boolean().optional()).optional(),
})

export const PuckDataSchema: z.ZodType<Data> = z.looseObject({
  content: z.array(PuckNodeSchema),
  root: z.looseObject({
    props: z.looseObject({}).optional(),
  }),
  zones: z.record(z.string(), z.array(PuckNodeSchema)).optional(),
})

export const SharedExposureKeySchema = z
  .string()
  .regex(/^instance_[0-9a-f]{8}(?:_[0-9a-f]{4}){3}_[0-9a-f]{12}$/iu)

export const SharedExposureSchema = z.object({
  key: SharedExposureKeySchema,
  nodeId: z.string().min(1),
  prop: z.string().min(1),
  label: z.string().trim().min(1),
})

export const SharedComponentDataSchema = z.object({
  name: z.string().trim().min(1),
  tree: PuckDataSchema,
  exposures: z.array(SharedExposureSchema),
  defaults: z.record(z.string(), JsonValueSchema),
})

export type SharedComponentData = z.infer<typeof SharedComponentDataSchema>

const PageKeySchema = z
  .string()
  .regex(/^[0-9a-zA-Z_./-]+$/u, "Valid characters: 0-9 a-z A-Z -_./")
  .regex(/^(\/|\/[^/]+(\/[^/]+)*)$/u, "Route segments cannot be empty")

export const PageSchema = z.object({
  key: PageKeySchema,
  data: PuckDataSchema,
  updatedAt: z.date(),
  updatedBy: z.string(),
})

export const ComponentTypeSchema = z.enum(["page", "shared"])
export type ComponentType = z.infer<typeof ComponentTypeSchema>

const ComponentKeySchema = z.string().min(1, "Component key cannot be empty")
const ExpectedUpdatedAtSchema = z
  .union([z.date(), z.iso.datetime().transform((value) => new Date(value))])
  .optional()

export const ComponentRecordSchema = z.discriminatedUnion("type", [
  PageSchema.extend({ key: ComponentKeySchema, type: z.literal("page") }),
  z.object({
    key: ComponentKeySchema,
    type: z.literal("shared"),
    data: SharedComponentDataSchema,
    updatedAt: z.date(),
    updatedBy: z.string(),
  }),
])

export const AddComponentSchema = z.discriminatedUnion("type", [
  z.object({ key: PageKeySchema, type: z.literal("page"), data: PuckDataSchema.optional() }),
  z.object({
    key: ComponentKeySchema,
    type: z.literal("shared"),
    data: SharedComponentDataSchema,
  }),
])

export const GetComponentSchema = z.object({ key: ComponentKeySchema })

export const DeleteComponentSchema = GetComponentSchema.extend({
  expectedUpdatedAt: ExpectedUpdatedAtSchema,
})

export const PublishComponentSchema = z.discriminatedUnion("type", [
  z.object({
    key: PageKeySchema,
    type: z.literal("page"),
    data: PuckDataSchema,
    expectedUpdatedAt: ExpectedUpdatedAtSchema,
  }),
  z.object({
    key: ComponentKeySchema,
    type: z.literal("shared"),
    data: SharedComponentDataSchema,
    expectedUpdatedAt: ExpectedUpdatedAtSchema,
  }),
])

export const ComponentMetaSchema = z.object({
  key: ComponentKeySchema,
  type: ComponentTypeSchema,
  updatedAt: z.date(),
  updatedBy: z.string(),
})

export type OberonComponentRecord = z.infer<typeof ComponentRecordSchema>

export type OberonSharedComponentRecord = Extract<OberonComponentRecord, { type: "shared" }>

export type OberonComponentMeta = MaybeOptimistic<z.infer<typeof ComponentMetaSchema>>

// Cannot infer from zod because we need nextjs to understand Page keys are valid Routes.
export type OberonPageMeta = MaybeOptimistic<
  z.infer<typeof ComponentMetaSchema> & {
    key: OberonRoute
    type: "page"
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
  addComponent: (component: OberonComponentRecord) => Promise<void>
  addImage: (data: z.infer<typeof ImageSchema>) => Promise<void>
  deleteComponent: (data: z.infer<typeof DeleteComponentSchema>) => Promise<void>
  // TODO uploadthing
  deleteImage: (data: z.infer<typeof DeleteImageSchema>) => Promise<void>
  deleteKV: (data: { namespace: string; key: string }) => Promise<void>
  getAllImages: () => Promise<OberonImage[]>
  listComponents: (type: ComponentType) => Promise<OberonComponentMeta[]>
  getComponent: (data: z.infer<typeof GetComponentSchema>) => Promise<OberonComponentRecord | null>
  getKV: (data: { namespace: string; key: string }) => Promise<JsonValue | null>
  getSite: () => Promise<OberonSite | undefined>
  putKV: (data: { namespace: string; key: string; value: JsonValue }) => Promise<void>
  updateComponent: (data: OberonComponentRecord & { expectedUpdatedAt?: Date }) => Promise<Date>
  withComponentTransaction: <Result>(write: () => Promise<Result>) => Promise<Result>
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
    onComponentWrite: () => Promise<void>
    onComponentChange: (component: Pick<OberonComponentRecord, "key" | "type">) => Promise<void>
  }

export type OberonMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type OberonHandler = {
  [key in OberonMethod]?: (req: Request) => Promise<Response> | Response
}

export type OberonAdapter = Omit<OberonPluginAdapter, "updateComponent"> & {
  updateComponent: (
    data: z.infer<typeof PublishComponentSchema> & Pick<OberonComponentRecord, "updatedBy">,
  ) => Promise<Date>
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
  getPage: (data: { key: string }) => Promise<{ key: string; data: PageData }>
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
  client: OberonClientConfig
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
export const ListComponentsSchema = z.object({ type: ComponentTypeSchema })
export const GetAllPathsSchema = z.undefined()
export const GetAllUsersSchema = z.undefined()
export const GetConfigSchema = z.undefined()
export const MigrateDataSchema = z.undefined()
export const SignOutSchema = z.undefined()

export const ResolvePathSchema = z.object({ key: z.string() })

export type OberonServerActions = {
  resolvePath: (data: z.infer<typeof ResolvePathSchema>) => Promise<{ key: string; data: PageData }>
  addComponent: (component: z.infer<typeof AddComponentSchema>) => OberonResponse<void>
  addImage: (data: OberonImage) => OberonResponse<OberonImage[]>
  addUser: (data: z.infer<typeof AddUserSchema>) => OberonResponse<OberonUser | null>
  deleteComponent: (data: z.infer<typeof DeleteComponentSchema>) => OberonResponse<void>
  deleteImage: (data: z.infer<typeof DeleteImageSchema>) => OberonResponse<void>
  deleteUser: (
    data: z.infer<typeof DeleteUserSchema>,
  ) => OberonResponse<Pick<OberonUser, "id"> | null>
  can: (data: z.infer<typeof CanSchema>) => OberonResponse<boolean>
  changeRole: (
    data: z.infer<typeof ChangeRoleSchema>,
  ) => OberonResponse<Pick<OberonUser, "role" | "id"> | null>
  getAllImages: (data?: z.infer<typeof GetAllImagesSchema>) => OberonResponse<OberonImage[]>
  listComponents: (
    data: z.infer<typeof ListComponentsSchema>,
  ) => OberonResponse<OberonComponentMeta[]>
  getAllPaths: (
    data?: z.infer<typeof GetAllPathsSchema>,
  ) => OberonResponse<Array<{ path: string[] }>>
  getAllUsers: (data?: z.infer<typeof GetAllUsersSchema>) => OberonResponse<OberonUser[]>
  getConfig: (data?: z.infer<typeof GetConfigSchema>) => OberonResponse<OberonSiteConfig>
  getComponent: (
    data: z.infer<typeof GetComponentSchema>,
  ) => OberonResponse<OberonComponentRecord | null>
  migrateData: (
    data?: z.infer<typeof MigrateDataSchema>,
  ) => OberonResponse<StreamResponseChunk<TransformResult | MigrationResult>>
  publishComponent: (
    data: z.infer<typeof PublishComponentSchema>,
  ) => OberonResponse<{ key: string; type: ComponentType; updatedAt: Date }>
  signIn: (data: z.infer<typeof SignInSchema>) => OberonResponse<void>
  signOut: (data?: z.infer<typeof SignOutSchema>) => OberonResponse<void>
}

/*
 * Context
 */

type DescriminatedContext =
  | {
      action: "edit" | "preview"
      data: Data | null
      updatedAt: Date | null
      sharedComponents?: Record<string, SharedComponentData>
    }
  | { action: "users"; data: OberonUser[] }
  | { action: "images"; data: OberonImage[] }
  | { action: "pages"; data: OberonComponentMeta[] }
  | {
      action: "library"
      data: {
        sources: OberonSharedComponentRecord[]
        sourceId: string | null
        returnTo: string | null
      }
    }
  | { action: "site"; data: OberonSiteConfig }
  | {
      action: "login"
      data: { callbackUrl: string; email: string; token: string }
    }

export type OberonClientContext = DescriminatedContext & {
  slug: string
}

const OberonQueryParamValueSchema = z.union([z.string(), z.number(), z.boolean()]).transform(String)

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
