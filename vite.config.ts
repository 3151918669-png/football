import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_PREVIEW_READ_ONLY": JSON.stringify(
      loadEnv(mode, process.cwd(), "").VITE_PREVIEW_READ_ONLY ??
        (process.env.VERCEL_ENV === "production" ? "false" : "true"),
    ),
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
  },
}));
