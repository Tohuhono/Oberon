import { NotImplementedError, type OberonPlugin } from "../lib/dtd"
import { getInitialData } from "./get-initial-data"

const mockUser = {
  id: "test-id",
  email: "test@tohuhono.com",
  role: "admin" as const,
}

const mockSite = {
  version: 1,
  components: {},
  updatedAt: new Date(),
  updatedBy: "test@tohuhono.com",
}

const mockPage = getInitialData()

const mockAllPages = [
  {
    key: mockPage.key,
    type: mockPage.type,
    updatedAt: mockPage.updatedAt,
    updatedBy: mockPage.updatedBy,
  },
]

function notAvailable(): never {
  throw new NotImplementedError("This action is not available in the demo")
}

export const mockPlugin: OberonPlugin = () => ({
  name: "mock-plugin",
  adapter: {
    addImage: () => notAvailable,
    addComponent: () => notAvailable,
    addUser: () => async () => mockUser,
    changeRole: () => notAvailable,
    deleteImage: () => notAvailable,
    deleteComponent: () => notAvailable,
    deleteKV: () => notAvailable,
    deleteUser: () => notAvailable,
    getAllImages: () => async () => [],
    listComponents: () => async (type) => mockAllPages.filter((page) => page.type === type),
    getAllUsers: () => async () => [mockUser],
    getCurrentUser: () => async () => mockUser,
    getComponent:
      () =>
      async ({ key }) =>
        key === mockPage.key ? mockPage : null,
    getKV: () => notAvailable,
    getSite: () => async () => mockSite,
    hasPermission: () => () => true,
    putKV: () => notAvailable,
    updateComponent: () => notAvailable,
    updateSite: () => notAvailable,
    signIn: () => notAvailable,
    signOut: () => async () => {},
  },
})
