import {
  INITIAL_DATA,
  PageDataSchema,
  ResponseError,
  SharedComponentDataSchema,
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

export async function resolvePage(adapter: OberonAdapter, key: string) {
  await adapter.will({ action: "pages", permission: "read" })
  const fragment = await adapter.getFragmentData({ key, type: "page" })

  if (!fragment || fragment.type !== "page") {
    return adapter.notFound()
  }

  return { key, data: fragment.data }
}

export function createActionHandler(adapter: OberonAdapter): OberonServerActions {
  return {
    resolvePath: ({ key }) => resolvePage(adapter, key),
    addFragment: (data) =>
      transport(async () => {
        const user = await adapter.whoWill({ action: "pages", permission: "write" })
        if (data.type === "page") {
          await adapter.addFragment({
            ...data,
            data: INITIAL_DATA,
            updatedAt: new Date(),
            updatedBy: user.email,
          })
        } else {
          await adapter.addFragment({
            ...data,
            updatedAt: new Date(),
            updatedBy: user.email,
          })
        }
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
    deleteFragment: (data) =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "write" })
        await adapter.deleteFragment(data)
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
    getAllFragments: (data) =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "read" })
        return adapter.getAllFragments(data.type)
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
    getFragmentData: (data) =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "read" })
        return adapter.getFragmentData(data)
      }),
    migrateData: () =>
      transport(async () => {
        const user = await adapter.whoWill({ action: "site", permission: "write" })
        return adapter.migrateData(user)
      }),
    publishFragmentData: (data) =>
      transport(
        async () => {
          const user = await adapter.whoWill({ action: "pages", permission: "write" })
          const schema = data.type === "page" ? PageDataSchema : SharedComponentDataSchema
          if (!schema.safeParse(data.data).success) {
            throw new ResponseError("Invalid Fragment data")
          }

          const updatedAt = await adapter.updateFragmentData({
            ...data,
            updatedAt: new Date(),
            updatedBy: user.email,
          })
          return { key: data.key, type: data.type, updatedAt }
        },
        {
          successMessage: ({ key, type }) =>
            type === "page"
              ? `Successfully published ${key}`
              : `Successfully published ${type} ${key}`,
        },
      ),
    signIn: (data) => transport(() => adapter.signIn(data)),
    signOut: () => transport(() => adapter.signOut()),
  }
}
