/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // Signed Supabase URLs + data URLs are used via <img>; keep unoptimized until
    // all media goes through next/image with known hosts.
    unoptimized: true,
  },
}

export default nextConfig
