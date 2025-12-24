import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // This allows the Google Sign-In popup to communicate back to your app
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
})