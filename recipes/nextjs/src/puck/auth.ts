// TODO edge runtime?
import { NextRequest } from "next/server"

import { redirect } from "next/navigation"
import { handlers as authHandlers } from "@/puck/src/auth/auth"

export const POST = authHandlers.POST

export const GET = (req: NextRequest) => {
  // safe links bot workaround https://github.com/nextauthjs/next-auth/issues/4965
  if (
    req.method === "GET" &&
    req.nextUrl.pathname === "/api/auth/callback/email" &&
    !req.nextUrl.searchParams.has("confirmed")
  ) {
    return new Response(
      redirect(
        `/api/auth/confirm?${new URLSearchParams(
          req.nextUrl.searchParams,
        ).toString()}`,
      ),
    )
  }

  return authHandlers.GET(req)
}
