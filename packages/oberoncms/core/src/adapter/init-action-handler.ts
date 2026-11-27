import {
  INITIAL_DATA,
  AddComponentSchema,
  PublishComponentSchema,
  ResponseError,
  type OberonAdapter,
  type OberonResponse,
  type OberonServerActions,
} from "../lib/dtd"

export async function transport<T>(
  action: () => Promise<T>,
  options: { successMessage?: string | ((result: T) => string | undefined) } = {},
): OberonResponse<T> {
  try {
    const result = await action()
    const message =
      typeof options.successMessage === "function"
        ? options.successMessage(result)
        : options.successMessage

    return {
      status: "success",
      message,
      result,
    }
  } catch (error) {
    if (error instanceof ResponseError) {
      return {
        status: "error",
        message: error.message,
      }
    }
    console.error(error)
    return {
      status: "error",
      message: "An unexpected error occured",
    }
  }
}

export function createActionHandler(adapter: OberonAdapter): OberonServerActions {
  return {
    resolvePath: adapter.getPage,
    addComponent: (input) =>
      transport(async () => {
        const user = await adapter.whoWill({ action: "pages", permission: "write" })
        const parsed = AddComponentSchema.safeParse(input)
        if (!parsed.success) {
          throw new ResponseError(parsed.error.issues[0]?.message ?? "Invalid Component data")
        }
        const data = parsed.data
        await adapter.addComponent({
          ...data,
          data: data.data ?? INITIAL_DATA,
          updatedAt: new Date(),
          updatedBy: user.email,
        })
      }),
    addImage: (data) =>
      transport(async () => {
        await adapter.will({ action: "images", permission: "write" })
        await adapter.addImage(data)
        return adapter.getAllImages()
      }),
    addUser: (data) =>
      transport(async () => {
        await adapter.will({ action: "users", permission: "write" })
        const { email, role } = data
        const { id } = await adapter.addUser({ email, role })
        return { id, email, role }
      }),
    deleteComponent: (data) =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "write" })
        await adapter.deleteComponent(data)
      }),
    deleteImage: (data) =>
      transport(async () => {
        await adapter.will({ action: "images", permission: "write" })
        await adapter.deleteImage(data)
      }),
    deleteUser: (data) =>
      transport(async () => {
        await adapter.will({ action: "users", permission: "write" })
        const { id } = data
        await adapter.deleteUser(data)
        return { id }
      }),
    can: (data) => transport(() => adapter.can(data)),
    changeRole: (data) =>
      transport(async () => {
        await adapter.will({ action: "users", permission: "write" })
        const { role, id } = data
        await adapter.changeRole({ role, id })
        return { role, id }
      }),
    getAllImages: () =>
      transport(async () => {
        await adapter.will({ action: "images", permission: "read" })
        return adapter.getAllImages()
      }),
    listComponents: (data) =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "read" })
        return adapter.listComponents(data.type)
      }),
    getAllPaths: () =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "read" })
        return adapter.getAllPaths()
      }),
    getAllUsers: () =>
      transport(async () => {
        await adapter.will({ action: "users", permission: "read" })
        return adapter.getAllUsers()
      }),
    getConfig: () =>
      transport(async () => {
        await adapter.will({ action: "site", permission: "read" })
        return adapter.getConfig()
      }),
    getComponent: (data) =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "read" })
        return adapter.getComponent(data)
      }),
    migrateData: () =>
      transport(async () => {
        const user = await adapter.whoWill({ action: "site", permission: "write" })
        return adapter.migrateData(user)
      }),
    publishComponentData: (input) =>
      transport(
        async () => {
          const user = await adapter.whoWill({ action: "pages", permission: "write" })
          const parsed = PublishComponentSchema.safeParse(input)
          if (!parsed.success) {
            throw new ResponseError("Invalid Component data")
          }
          const data = parsed.data

          const updatedAt = await adapter.updateComponentData({
            ...data,
            updatedAt: new Date(),
            updatedBy: user.email,
          })
          return { key: data.key, type: data.type, updatedAt }
        },
        { successMessage: ({ key }) => `Successfully published ${key}` },
      ),
    signIn: (data) => transport(() => adapter.signIn(data)),
    signOut: () => transport(() => adapter.signOut()),
  }
}
