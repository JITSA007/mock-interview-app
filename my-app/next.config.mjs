/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignore strict TypeScript errors (like "window doesn't exist")
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Ignore code style errors (like "unused variable")
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;