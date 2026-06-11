import { beforeEach, describe, expect, it } from "@dev/vitest"
import { vi } from "vitest"

import { stubbedAdapter } from "./adapter/stubbed-adapter"
import { authPlugin } from "./auth"
import { type OberonUser } from "./lib/dtd"

function createAuthPlugin(users: OberonUser[] = []) {
  const addUser = vi.fn(async ({ email, role }) => ({ id: "created-user", email, role }))
  const getAllUsers = vi.fn(async () => users)
  const plugin = authPlugin({
    ...stubbedAdapter,
    addUser,
    getAllUsers,
  })

  if (!plugin.bootstrap) {
    throw new Error("Expected auth plugin to expose bootstrap")
  }

  return { addUser, getAllUsers, bootstrap: plugin.bootstrap }
}

describe("authPlugin bootstrap", { tags: ["ai", "feature-better-auth-migration"] }, () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it("creates a normalized MASTER_EMAIL admin after earlier bootstrap work", async () => {
    vi.stubEnv("MASTER_EMAIL", " Rescue@Example.com ")
    const events: string[] = []
    const { addUser, getAllUsers, bootstrap } = createAuthPlugin()

    getAllUsers.mockImplementation(async () => {
      events.push("check users")
      return []
    })
    addUser.mockImplementation(async ({ email, role }) => {
      events.push("add user")
      return { id: "created-user", email, role }
    })

    await bootstrap(async () => {
      events.push("previous bootstrap")
    })

    expect(events).toEqual(["previous bootstrap", "check users", "add user"])
    expect(addUser).toHaveBeenCalledWith({
      email: "rescue@example.com",
      role: "admin",
    })
  })

  it("does not read users when MASTER_EMAIL is missing", async () => {
    const { addUser, getAllUsers, bootstrap } = createAuthPlugin()

    await bootstrap(async () => {})

    expect(getAllUsers).not.toHaveBeenCalled()
    expect(addUser).not.toHaveBeenCalled()
  })

  it("does not duplicate an existing MASTER_EMAIL user", async () => {
    vi.stubEnv("MASTER_EMAIL", "RESCUE@example.com")
    const { addUser, bootstrap } = createAuthPlugin([
      {
        id: "existing-user",
        email: "rescue@example.com",
        role: "admin",
      },
    ])

    await bootstrap(async () => {})

    expect(addUser).not.toHaveBeenCalled()
  })
})
