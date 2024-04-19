// @ts-check

// import withBundleAnalyzer from "@next/bundle-analyzer"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
}

//withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig)

export default nextConfig
