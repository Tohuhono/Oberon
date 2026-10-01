import { describe, expect, it, vi } from "@dev/vitest"

import { createRestHandler } from "./handler"

describe("createRestHandler", { tags: ["ai", "feature-framework-handlers"] }, () => {
  it("maps TanStack splat params and methods to the Adapter request handler", async () => {
    const response = new Response("ok")
    const handleRequest = vi.fn(async () => response)
    const request = new Request("http://localhost/cms/api/auth")
    const handler = createRestHandler({ handleRequest })

    await expect(handler.POST({ request, params: { _splat: "auth/sign-in" } })).resolves.toBe(
      response,
    )
    expect(handleRequest).toHaveBeenCalledWith(request, {
      method: "POST",
      path: "auth/sign-in",
    })
  })
})
