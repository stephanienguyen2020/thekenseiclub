/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "i.kym-cdn.com",
      "cryptologos.cc",
      "example.com",
      "placehold.co",
      "picsum.photos",
      "via.placeholder.com",
      "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      "cdn.jsdelivr.net",
      "assets.coingecko.com",
      "newsapi.org",
      "www.google.com",
      "media.newyorker.com",
      "i.insider.com",
      "media.zenfs.com",
      "theintercept.com",
      "imageio.forbes.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
};

module.exports = nextConfig;
