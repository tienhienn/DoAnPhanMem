import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      // force using ESM entry for recharts to avoid CJS bundling issues
      recharts: require.resolve("recharts/es6/index.js")
    }
  },
  optimizeDeps: {
    include: ["jsqr", "recharts", "es-toolkit"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    passWithNoTests: true,
  },
});
