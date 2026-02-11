import { Footer, Layout, Navbar } from "nextra-theme-docs"
import { Head } from "nextra/components"
import { getPageMap } from "nextra/page-map"
import Image from "next/image"
// Required for theme styles, previously was imported under the hood
import "nextra-theme-docs/style.css"
export const metadata = {
  // ... your metadata API
  // https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}

const navbar = (
  <Navbar
    logo={
      <div className="flex flex-row items-center gap-2">
        <Image src="/icon.svg" width="30" height="30" alt="OberonCMS logo" />
        <div className="text-logo text-xl font-extrabold">OberonCMS</div>
      </div>
    }
    projectLink="https://github.com/tohuhono/oberon"
  />
)
const footer = (
  <Footer className="flex-col items-center md:items-start">
    MIT {new Date().getFullYear()} © Nextra.
  </Footer>
)

export default async function RootLayout({
  children,
}: LayoutProps<"/[[...mdxPath]]">) {
  const siteUrl = "https://tohuhono.com"

  const defaultTitle = `OberonCMS - The NextJS Content Management System`
  const description = `A CMS for developers, designers and content creators. Get started quickly, build beautiful performant websites.`

  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
        backgroundColor={{
          dark: "rgb(15, 23, 42)",
          light: "rgb(254, 252, 232)",
        }}
        color={{
          hue: { dark: 182.5, light: 0 },
          saturation: { dark: 100, light: 100 },
        }}
      >
        {/* TODO
        <link rel="canonical" href={`${siteUrl}${asPath}`} />
        <meta property="og:url" content={url} />
        */}
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
        <meta name="twitter:title" content={defaultTitle} />

        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/tohuhono/oberon/tree/main/apps/documentation"
          editLink="Edit this page on GitHub"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          footer={footer}
          // ...Your additional theme config options
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
