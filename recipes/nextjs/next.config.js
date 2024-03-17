// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    instrumentationHook: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/f/**",
      },
    ],
  },
  // Hack to make nextjs see changes and not cache our packages
  // https://github.com/vercel/next.js/discussions/33929#discussioncomment-2710035
  webpack: (config) => {
    if (config.dev) {
      console.log("it's dev time!")
    }

    config.watchOptions = {
      ...config.watchOptions,
      followSymlinks: true,
    }

    config.snapshot = {
      ...(config.snapshot ?? {}),
      // Add all node_modules but @oberon module to managedPaths
      // Allows for hot refresh of changes to @next module
      managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@oberon)/],
    }

    return config
  },
}

const withNextBundleAnalyzer = process.env.ANALYZE
  ? // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("@next/bundle-analyzer")()
  : (config) => config

module.exports = withNextBundleAnalyzer(nextConfig)
