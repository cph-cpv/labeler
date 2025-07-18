import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  server: {
    watch: {
      ignored: ["**/tests/**", "input", "playwright", "pocketbase"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@fake": resolve(__dirname, "./src/fake"),
    },
  },
});
