"use client"
import { Button } from "@oberon/ui/button"
import Link from "next/link"

// safe links bot workaround https://github.com/nextauthjs/next-auth/issues/4965
export function VerifyPage() {
  return (
    <div className="grid h-screen w-full place-content-center">
      <h2> Check your email</h2>
      <p>A sign in link has been sent to your email address.</p>

      <Link href="/api/auth/signin">
        <Button>Try again</Button>
      </Link>
    </div>
  )
}
