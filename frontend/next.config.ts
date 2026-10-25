import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // build to frontend/out
  trailingSlash: true, // /dashboard/leads -> leads/index.html
  images: { unoptimized: true },

  turbopack: {
    root: path.resolve(__dirname),
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
