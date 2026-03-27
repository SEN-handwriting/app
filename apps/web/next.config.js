/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@repo/database", "@repo/auth", "@repo/ui"],

  webpack(config) {
    // Prisma 7 (prisma-client generator) outputs TypeScript files with .js imports.
    // Webpack needs to try .ts/.tsx when it can't resolve a .js file.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
