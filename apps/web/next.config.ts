import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Transpile shared package
  transpilePackages: ["@adhd-focus/shared"],

  // Ensure bcryptjs is included in standalone output
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
