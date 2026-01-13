import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Transpile shared package
  transpilePackages: ["@adhd-focus/shared"],
};

export default nextConfig;
