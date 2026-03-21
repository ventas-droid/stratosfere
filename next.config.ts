import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // 🔥 EL NUEVO SOPORTE DE FOTOS (CLOUDFLARE R2) QUE MONTAMOS AYER 🔥
      { protocol: "https", hostname: "pub-91a7b06ba4714b50b36fb9d8df951419.r2.dev" },
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