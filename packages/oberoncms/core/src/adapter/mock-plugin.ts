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
    addFragment: () => notAvailable,
    addUser: () => async () => mockUser,
    changeRole: () => notAvailable,
    deleteImage: () => notAvailable,
    deleteFragment: () => notAvailable,
    deleteKV: () => notAvailable,
    deleteUser: () => notAvailable,
    getAllImages: () => async () => [],
    getAllFragments: () => async (type) =>
      type === "page" ? mockAllPages.map((page) => ({ ...page, type: "page" as const })) : [],
    getAllUsers: () => async () => [mockUser],
    getCurrentUser: () => async () => mockUser,
    getFragmentData:
      () =>
      async ({ key, type }) =>
        key === "/" && type === "page" ? mockPage : null,
    getKV: () => notAvailable,
    getSite: () => async () => mockSite,
    hasPermission: () => () => true,
    putKV: () => notAvailable,
    updateFragmentData: () => notAvailable,
    updateSite: () => notAvailable,
    signIn: () => notAvailable,
    signOut: () => async () => {},
  },
})
