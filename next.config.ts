import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import path from "path";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
  images: {
    remotePatterns: [new URL('https://amber-main-grasshopper-167.mypinata.cloud/ipfs/**')],
  },
};

export default nextConfig;
