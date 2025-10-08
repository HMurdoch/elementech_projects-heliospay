import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const target = env.VITE_API_URL || "http://localhost:5000"; // backend dev URL

    return {
        plugins: [react()],
        server: {
            port: 3000,
            strictPort: true,
            proxy: {
                // Any fetch to /api/* goes to backend, keeping path unchanged
                "/api": {
                    target,
                    changeOrigin: true,
                    secure: false,
                },
                // Optional: Swagger static files (handy link from the UI)
                "/index.html": {
                    target,
                    changeOrigin: true,
                    secure: false,
                },
                "/swagger": {
                    target,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});