import { generateNextraMetadata, NextraPage } from "@/components/nextra-page"

export { generateStaticParams } from "@/components/nextra-page"

export async function generateMetadata(
  props: PageProps<"/docs/[[...mdxPath]]">,
) {
  return generateNextraMetadata([
    "docs",
    ...((await props.params).mdxPath || []),
  ])
}

export default async function Page(props: PageProps<"/docs/[[...mdxPath]]">) {
  const path = ["docs", ...((await props.params).mdxPath || [])]
  return <NextraPage path={path} />
}
