/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Add your Supabase/R2 storage domain here once provisioned, e.g.:
      // { protocol: "https", hostname: "xxxx.supabase.co" },
    ],
  },
  // Railway sets PORT automatically; Next.js respects it via `next start` by default.
};

module.exports = nextConfig;
