import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al dev server desde tablet/LAN (p. ej. http://192.168.x.x:3000)
  allowedDevOrigins: ["192.168.80.229"],
};

export default nextConfig;
