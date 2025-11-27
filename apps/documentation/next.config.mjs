// @ts-check

import nextra from "nextra"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}

const withNextra = nextra({
  // ... your Nextra config
})

export default withNextra(nextConfig)
