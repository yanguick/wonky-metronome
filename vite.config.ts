import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // GitHub Pages serves the app from /wonky-metronome/
  base: "/wonky-metronome/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "icon.svg",
        "apple-touch-icon.png",
        "pwa-192.png",
        "pwa-512.png",
        "maskable-512.png"
      ],
      manifest: {
        name: "킹받는 메트로놈",
        short_name: "킹메트로",
        description: "지멋대로 움직이는놈",
        theme_color: "#0f0f14",
        background_color: "#0f0f14",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});
