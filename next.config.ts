import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up past the repo and
  // can pick up an unrelated lockfile from a parent directory, which changes how
  // modules resolve.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
