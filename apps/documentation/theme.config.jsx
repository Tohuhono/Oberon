/* eslint-disable react-hooks/rules-of-hooks */
import { useConfig } from "nextra-theme-docs"
import Image from "next/image"
import { useRouter } from "next/router"

export default {
  logo: (
    <div className="flex flex-row items-center gap-2">
      <Image src="/icon.svg" width="30" height="30" alt="OberonCMS logo" />
      <div className="text-xl font-extrabold text-logo">OberonCMS</div>
    </div>
  ),
  project: {
    link: "https://github.com/tohuhono/oberon",
  },
  docsRepositoryBase:
    "https://github.com/tohuhono/oberon/tree/main/apps/documentation",
  useNextSeoProps() {
    return {
      titleTemplate: "%s - OberonCMS",
    }
  },
  head: () => {
    const { asPath, defaultLocale, locale } = useRouter()
    const { frontMatter, title } = useConfig()

    const siteUrl = "https://tohuhono.com"
    const url =
      siteUrl + (defaultLocale === locale ? asPath : `/${locale}${asPath}`)

    const defaultTitle = `OberonCMS - The NextJS Content Management System`
    const description =
      frontMatter.description ||
      `A CMS for developers, designers and content creators. Get started quickly, build beautiful performant websites.`

    return (
      <>
        <link rel="canonical" href={`${siteUrl}${asPath}`} />
        <meta property="og:url" content={url} />
        <meta property="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${siteUrl}/social.png`} />
        <meta property="og:image:height" content="675" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:alt" content="OberonCMS" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content={defaultTitle} />
        <meta name="image" content={`${siteUrl}/social.png`} />
        <meta itemProp="image" content={`${siteUrl}/social.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${siteUrl}/social.png`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image:alt" content="OberonCMS" />
        <meta name="twitter:image:height" content="675" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:image:width" content="1200" />
        <meta
          name="twitter:title"
          content={
            title !== defaultTitle ? `${title} - OberonCMS` : defaultTitle
          }
        />

        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </>
    )
  },
}
