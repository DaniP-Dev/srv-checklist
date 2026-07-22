import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  // Permite acceder al dev server desde tablet/LAN (p. ej. http://192.168.x.x:3000)
  allowedDevOrigins: ["192.168.80.229"],
  experimental: {
    serverActions: {
      // Bajo el techo duro de Vercel (~4.5 MB) para evitar 413 FUNCTION_PAYLOAD_TOO_LARGE
      bodySizeLimit: "4mb",
    },
  },
};

export default withSerwist(nextConfig);
