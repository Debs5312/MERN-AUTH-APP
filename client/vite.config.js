import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // target: "http://auth-authapi:3000",
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
