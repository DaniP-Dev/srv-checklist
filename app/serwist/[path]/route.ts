import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

/** Rutas de documento que deben abrir sin red tras la primera instalación. */
const OFFLINE_DOCUMENT_ROUTES = [
  "/",
  "/~offline",
  "/inspeccion/acta-tecnica",
  "/inspeccion/checklist-campo",
] as const;

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: OFFLINE_DOCUMENT_ROUTES.map((url) => ({
      url,
      revision,
    })),
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
