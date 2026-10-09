import { generateNextraMetadata, NextraPage } from "@/components/nextra-page"

export { generateStaticParams } from "@/components/nextra-page"

export async function generateMetadata(props: PageProps<"/[[...mdxPath]]">) {
  return generateNextraMetadata((await props.params).mdxPath || [])
}

export default async function Page(props: PageProps<"/[[...mdxPath]]">) {
  const path = (await props.params).mdxPath || []
  return <NextraPage path={path} />
}
