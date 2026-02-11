import { NextraLayout } from "@/components/nextra-layout"

export const metadata = {
  // ... your metadata API
  // https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}

export default async function Layout({ children }: LayoutProps<"/">) {
  return <NextraLayout>{children}</NextraLayout>
}
