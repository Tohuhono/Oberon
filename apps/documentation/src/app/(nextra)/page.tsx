import { generateNextraMetadata, NextraPage } from "@/components/nextra-page"

export { generateStaticParams } from "@/components/nextra-page"

export async function generateMetadata() {
  return generateNextraMetadata([])
}

export default async function Page() {
  return <NextraPage path={[]} />
}
