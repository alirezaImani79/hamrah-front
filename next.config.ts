import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained `.next/standalone` server. The production Docker
  // image (see Dockerfile) runs this directly with `node server.js`, with no
  // need for node_modules at runtime. Remove this and the image won't boot.
  output: "standalone",
};

export default nextConfig;
