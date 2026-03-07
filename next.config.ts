import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    qualities: [60, 75], // ✅ añade 60 (y deja 75)
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // 💥 ABRIMOS LA COMPUERTA HASTA 20 MEGAS
    },
  },
};

export default nextConfig;