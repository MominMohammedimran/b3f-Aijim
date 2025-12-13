import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [`xlqsxk-8081.csb.app`],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png", "aijim-uploads/*.png"],
      manifest: {
        name: "AIJIM",
        short_name: "AIJIM",
        description: "Premium Clothing and Streetwear",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/aijim-uploads/aijim-black.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/aijim-uploads/aijim-black.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/aijim-uploads/aijim-black.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        globIgnores: ["**/lovable-uploads/banner-images/**"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ik\.imagekit\.io\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "imagekit-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));