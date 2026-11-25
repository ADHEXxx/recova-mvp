import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .filter(({ family, internal }) => family === "IPv4" && !internal)
    .map(({ address }) => address),
};

export default nextConfig;
