import { redirect } from "next/navigation"
import {
  ResponseError,
  type OberonCanAdapter,
  type OberonDatabaseAdapter,
  type OberonPlugin,
} from "../lib/dtd"
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
  throw new ResponseError("This action is not available in the demo")
}

export const mockPlugin: OberonPlugin = () => ({
  name: "mock-plugin",
  adapter: {
    addImage: notAvailable,
    addPage: notAvailable,
    addUser: async () => mockUser,
    changeRole: notAvailable,
    deleteImage: notAvailable,
    deletePage: notAvailable,
    deleteUser: notAvailable,
    getAllImages: async () => [],
    getAllPages: async () => mockAllPages,
    getAllUsers: async () => [mockUser],
    getCurrentUser: async () => mockUser,
    getPageData: async (key) => (key === "/" ? mockPage.data : null),
    getSite: async () => mockSite,
    hasPermission: () => true,
    updatePageData: notAvailable,
    updateSite: notAvailable,
    signOut: async () => redirect("/"),
  } satisfies OberonDatabaseAdapter & OberonCanAdapter,
})
