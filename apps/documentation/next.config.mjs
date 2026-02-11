// @ts-check

import nextra from "nextra"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}

const withNextra = nextra({
  defaultShowCopyCode: true,
  readingTime: true,
})

export default withNextra(nextConfig)
