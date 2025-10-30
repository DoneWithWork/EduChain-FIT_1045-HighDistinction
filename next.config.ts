import type { NextConfig } from "next";


const nextConfig: NextConfig = {

  images: {
    remotePatterns: [new URL('https://amber-main-grasshopper-167.mypinata.cloud/ipfs/**')],
  },
};

export default nextConfig;