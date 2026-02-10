import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const BASE_PATH = "/projects/podcast/";

export default defineConfig({
  base: BASE_PATH,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      [`${BASE_PATH}api`]: {
        target: "http://localhost:3000",
        rewrite: (p) => p.replace(BASE_PATH, "/"),
      },
      [`${BASE_PATH}uploads`]: {
        target: "http://localhost:3000",
        rewrite: (p) => p.replace(BASE_PATH, "/"),
      },
    },
  },
});
