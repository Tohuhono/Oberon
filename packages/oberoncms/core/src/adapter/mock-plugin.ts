import { redirect } from "next/navigation"
import {
  NotImplementedError,
  type OberonCanAdapter,
  type OberonBaseAdapter,
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
  throw new NotImplementedError("This action is not available in the demo")
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
    deleteKV: notAvailable,
    deleteUser: notAvailable,
    getAllImages: async () => [],
    getAllPages: async () => mockAllPages,
    getAllUsers: async () => [mockUser],
    getCurrentUser: async () => mockUser,
    getPageData: async (key) => (key === "/" ? mockPage.data : null),
    getKV: notAvailable,
    getSite: async () => mockSite,
    hasPermission: () => true,
    putKV: notAvailable,
    updatePageData: notAvailable,
    updateSite: notAvailable,
    signIn: notAvailable,
    signOut: async () => redirect("/"),
  } satisfies OberonBaseAdapter & OberonCanAdapter,
})
