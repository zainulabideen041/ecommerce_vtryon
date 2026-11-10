import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { localCatalogPlugin } from "./tools/local-catalog.mjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localCatalogPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
