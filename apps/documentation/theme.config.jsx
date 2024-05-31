import { useConfig } from "nextra-theme-docs"
import Image from "next/image"

export default {
  logo: <Image src="/icon.svg" width="30" height="30" alt="OberonCMS logo" />,
  project: {
    link: "https://github.com/tohuhono/oberon",
  },
  docsRepositoryBase:
    "https://github.com/tohuhono/oberon/tree/main/apps/documentation/",
  useNextSeoProps() {
    return {
      titleTemplate: "%s – SWR",
    }
  },
  head: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { frontMatter } = useConfig()

    return (
      <>
        <meta
          property="og:title"
          content={frontMatter.title || "OberonCMS Documentation"}
        />
        <meta
          property="og:description"
          content={
            frontMatter.description ||
            "A CMS for developers, designers and content creators."
          }
        />
      </>
    )
  },

  // ... other theme options
}
