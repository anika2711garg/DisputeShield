import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  serverExternalPackages: ["openai"],
  poweredByHeader: false,
};

export default nextConfig;
