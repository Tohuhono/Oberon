/*
export createBaseActionFactorytype OberonServerActions = {
  addPage: (page: z.infer<typeof AddPageSchema>) => OberonResponse<void>
  addImage: (data: OberonImage) => OberonResponse<OberonImage[]>
  addUser: (data: z.infer<typeof AddUserSchema>) => OberonResponse<OberonUser | null>
  deletePage: (data: z.infer<typeof DeletePageSchema>) => OberonResponse
  deleteImage: (key: OberonImage["key"]) => OberonResponse
  deleteUser: (
    data: z.infer<typeof DeleteUserSchema>,
  ) => OberonResponse<Pick<OberonUser, "id"> | null>
  can: (action: AdapterActionGroup, permission?: AdapterPermission) => OberonResponse<boolean>
  changeRole: (
    data: z.infer<typeof ChangeRoleSchema>,
  ) => OberonResponse<Pick<OberonUser, "role" | "id"> | null>
  getAllImages: () => OberonResponse<OberonImage[]>
  getAllPages: () => OberonResponse<OberonPageMeta[]>
  getAllPaths: () => OberonResponse<Array<{ path: string[] }>>
  getAllUsers: () => OberonResponse<OberonUser[]>
  getConfig: () => OberonResponse<OberonSiteConfig>
  getPageData: (key: OberonPageMeta["key"]) => OberonResponse<Data | null>
  migrateData: () => OberonResponse<StreamResponseChunk<TransformResult | MigrationResult>>
  publishPageData: (data: z.infer<typeof PublishPageSchema>) => OberonResponse
  signIn: (data: { email: string }) => OberonResponse
  signOut: () => OberonResponse
}
*/
