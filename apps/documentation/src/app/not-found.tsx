import { NextraLayout } from "@/components/nextra-layout"

export default function NotFound() {
  return (
    <NextraLayout>
      <div className="flex h-full justify-center bg-amber-400 p-16 align-middle">
        <h1>404 - page not found</h1>
      </div>
    </NextraLayout>
  )
}
