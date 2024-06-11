import { redirect } from "next/navigation"
import type {
  OberonCanAdapter,
  OberonDatabaseAdapter,
  OberonPlugin,
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

export const mockPlugin: OberonPlugin = () => ({
  name: "mock-plugin",
  adapter: {
    addImage: async () => {},
    addPage: async () => {},
    addUser: async () => mockUser,
    changeRole: async () => {},
    deleteImage: async () => {},
    deletePage: async () => {},
    deleteUser: async () => undefined,
    getAllImages: async () => [],
    getAllPages: async () => mockAllPages,
    getAllUsers: async () => [mockUser],
    getCurrentUser: async () => mockUser,
    getPageData: async (key) => (key === "/" ? mockPage.data : null),
    getSite: async () => mockSite,
    hasPermission: () => true,
    updatePageData: async () => {},
    updateSite: async () => {},
    signOut: async () => {
      redirect("/")
    },
  } satisfies OberonDatabaseAdapter & OberonCanAdapter,
})
