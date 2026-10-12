import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/",

  server: {
    allowedHosts: [
      "kl2641e2kfr3.shares.zrok.io",
    ],
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      input: {
        kcet: resolve(import.meta.dirname, "kcet/index.html"),
        comedk: resolve(import.meta.dirname, "comedk/index.html"),
        "kcet-college-predictor": resolve(
          import.meta.dirname,
          "kcet-college-predictor/index.html"
        ),
        "privacy-policy": resolve(import.meta.dirname, "privacy-policy.html"),
        terms: resolve(import.meta.dirname, "terms.html"),
        // Custom 404 — GitHub Pages serves this for any unresolved path
        404: resolve(import.meta.dirname, "404.html"),
      },

      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
});