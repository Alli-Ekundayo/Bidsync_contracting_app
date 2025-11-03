import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    // Allow these external hosts
    allowedHosts: [
      'bidsync.onrender.com',
      'www.bidoogle.com',
      'bidoogle.com'
    ],
  },
  preview: {
    host: "::",
    port: 3000,
    // Allow these external hosts in preview mode
    allowedHosts: [
      'bidsync.onrender.com',
      'www.bidoogle.com',
      'bidoogle.com'
    ],
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
