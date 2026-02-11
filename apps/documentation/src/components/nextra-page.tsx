import { generateStaticParamsFor, importPage } from "nextra/pages"
import { useMDXComponents } from "@/mdx-components"

const getMDXComponents = useMDXComponents

const Wrapper = getMDXComponents().wrapper

export const generateStaticParams = generateStaticParamsFor("mdxPath")

export async function generateNextraMetadata(path: string[]) {
  const { metadata } = await importPage(path)
  return metadata
}

export async function NextraPage({ path }: { path: string[] }) {
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode,
  } = await importPage(path)
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent params={path} />
    </Wrapper>
  )
}
