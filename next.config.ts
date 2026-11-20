import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Landing page photography
      { protocol: "https", hostname: "images.unsplash.com" },
      // Service & profile images uploaded via ImgBB
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
}

export default nextConfig
