import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  plugins: [
    react(),
    tailwindcss(),
  ],
})