import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bake the current git branch into the client bundle so every deployment
  // knows which playground it is. Vercel sets VERCEL_GIT_COMMIT_REF automatically.
  env: {
    NEXT_PUBLIC_GIT_BRANCH: process.env.VERCEL_GIT_COMMIT_REF ?? "local",
  },
};

export default nextConfig;
