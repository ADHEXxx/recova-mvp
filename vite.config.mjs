import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  root: path("./pages-preview"),
  base: "./",
  publicDir: false,
  define: {
    "process.env.NEXT_PUBLIC_RECOVA_STATIC": JSON.stringify("true"),
  },
  resolve: {
    alias: {
      "@": path("./"),
      "next/link": path("./pages-preview/link.tsx"),
      "next/navigation": path("./pages-preview/navigation.ts"),
      "next/image": path("./pages-preview/image.tsx"),
    },
  },
  build: {
    outDir: path("./out"),
    emptyOutDir: true,
  },
});
