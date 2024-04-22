"use client"
import { redirect } from "next/navigation"

import { useState } from "react"
import { Button } from "@tohuhono/ui/button"
import { Input } from "@tohuhono/ui/input"

// safe links bot workaround https://github.com/nextauthjs/next-auth/issues/4965
export function ConfirmPage({
  searchParams: { callbackUrl, email, token: queryToken },
}: {
  searchParams: {
    callbackUrl: string
    email: string
    token: string
  }
}) {
  const [token, setToken] = useState(queryToken)
  //const router = useRouter()
  if (email) {
    // TODO add recaptcha or similar to automate this
    return (
      <div className="grid h-screen w-full place-content-center">
        <form action="/api/auth/callback/email" method="get">
          <Input
            name="token"
            value={token}
            onChange={(event) => {
              setToken(event.currentTarget.value)
            }}
          />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="confirmed" value="true" />
          <Button type="submit">Complete sign in</Button>
        </form>
      </div>
    )
  }

  return redirect("/cms")
}
