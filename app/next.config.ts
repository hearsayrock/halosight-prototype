import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Bake the current git branch into the client bundle so every deployment
  // knows which playground it is. Vercel sets VERCEL_GIT_COMMIT_REF automatically.
  env: {
    NEXT_PUBLIC_GIT_BRANCH: process.env.VERCEL_GIT_COMMIT_REF ?? "local",
  },
  // Pin Turbopack to this directory so a root-level package-lock.json
  // (from the expo workspace) doesn't confuse workspace root detection.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
