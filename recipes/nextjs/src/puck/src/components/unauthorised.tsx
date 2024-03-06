"use client"

import Error from "next/error"

export function Unauthorised() {
  return <Error statusCode={401} title="Unauthorised" />
}
