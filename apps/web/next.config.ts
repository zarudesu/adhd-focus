import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Transpile shared package
  transpilePackages: ["@adhd-focus/shared"],

  // Ensure bcryptjs is traced and included in standalone output
  outputFileTracingIncludes: {
    "/api/auth/\\[...nextauth\\]": ["./node_modules/bcryptjs/**/*"],
    "/login": ["./node_modules/bcryptjs/**/*"],
    "/signup": ["./node_modules/bcryptjs/**/*"],
  },
};

export default nextConfig;
