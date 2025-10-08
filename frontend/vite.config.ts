import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            // All requests to /api/* are proxied to the API
            '/api': {
                target: 'http://localhost:5000',   // or 'https://localhost:5001' if you keep UseHttpsRedirection
                changeOrigin: true,
                secure: false
            }
        }
    }
})