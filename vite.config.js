import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // Three.js is a big library; one ~650 kB file (170 kB gzipped) is fine for this demo.
  build: { chunkSizeWarningLimit: 800 },
});
