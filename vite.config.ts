import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/",

  server: {
    allowedHosts: ["kl2641e2kfr3.shares.zrok.io"],
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        blogs: resolve(import.meta.dirname, "blogs/index.html"),
        faculties: resolve(import.meta.dirname, "faculties/index.html"),
        test: resolve(import.meta.dirname, "test/index.html"),
        tests: resolve(import.meta.dirname, "tests/index.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("katex")) {
            return "katex";
          }
        },
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
});
