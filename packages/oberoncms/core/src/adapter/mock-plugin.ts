import type { OberonPlugin } from "../lib/dtd"

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
    getAllPages: async () => [],
    getAllUsers: async () => [mockUser],
    getCurrentUser: async () => mockUser,
    getPageData: async () => null,
    getSite: async () => mockSite,
    hasPermission: () => true,
    updatePageData: async () => {},
    updateSite: async () => {},
  },
})
